import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/contacts", () => ({ createContact: vi.fn() }));
vi.mock("@/lib/db", () => ({ logActivity: vi.fn(), logPageEvent: vi.fn() }));
vi.mock("@/lib/email", () => ({
  sendMail: vi.fn(),
  leadNotificationEmail: vi.fn(() => ({ subject: "New lead", html: "<p>hi</p>" })),
  getNotifyEmail: vi.fn(() => "owner@example.com"),
}));

const SEO_ORIGIN = "https://seo.example.com";

async function loadRoute() {
  vi.resetModules();
  vi.stubEnv("ALLOWED_ORIGINS", SEO_ORIGIN);
  const route = await import("./route");
  const { createContact } = await import("@/lib/contacts");
  const { logActivity, logPageEvent } = await import("@/lib/db");
  const { sendMail, getNotifyEmail } = await import("@/lib/email");
  vi.mocked(createContact).mockResolvedValue({ id: 99, intent: "sell" } as never);
  return { route, createContact, logActivity, logPageEvent, sendMail, getNotifyEmail };
}

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const valid = { name: "Jane", email: "jane@example.com", intent: "sell", sessionId: "sess-1" };

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/lead", () => {
  it("rejects a body that is not valid JSON with 400", async () => {
    const { route, createContact } = await loadRoute();
    const res = await route.POST(post("{not json"));
    expect(res.status).toBe(400);
    expect(createContact).not.toHaveBeenCalled();
  });

  it.each([
    ["missing email", { name: "Jane" }],
    ["missing name", { email: "jane@example.com" }],
    ["empty body", {}],
  ])("rejects %s with 422 and stores nothing", async (_label, body) => {
    const { route, createContact } = await loadRoute();
    const res = await route.POST(post(body));
    expect(res.status).toBe(422);
    expect(createContact).not.toHaveBeenCalled();
  });

  it("creates a contact from a valid lead, tagged with its session and a follow-up date", async () => {
    const { route, createContact } = await loadRoute();
    const before = Date.now();
    const res = await route.POST(post(valid));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: 99 });

    const input = vi.mocked(createContact).mock.calls[0][0];
    expect(input).toMatchObject({
      source: "lead_form",
      status: "new",
      name: "Jane",
      email: "jane@example.com",
      session_id: "sess-1",
    });
    const followUp = new Date(input.next_follow_up_at as string).getTime();
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    expect(followUp - before).toBeGreaterThanOrEqual(twoDays - 1000);
    expect(followUp - before).toBeLessThan(twoDays + 5000);
  });

  it("records the origin site in the activity log", async () => {
    const { route, logActivity } = await loadRoute();
    await route.POST(post(valid, { origin: SEO_ORIGIN }));
    expect(logActivity).toHaveBeenCalledWith(99, "lead_submitted", {
      intent: "sell",
      originSite: SEO_ORIGIN,
    });
  });

  it("emails the notification address when one is configured", async () => {
    const { route, sendMail } = await loadRoute();
    await route.POST(post(valid));
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "owner@example.com" }));
  });

  it("still saves the lead when no notification address is configured", async () => {
    const { route, sendMail, getNotifyEmail } = await loadRoute();
    vi.mocked(getNotifyEmail).mockReturnValue(undefined);
    const res = await route.POST(post(valid));
    expect(res.status).toBe(200);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("adds CORS headers for an allowed origin and none for others", async () => {
    const { route } = await loadRoute();
    const allowed = await route.POST(post(valid, { origin: SEO_ORIGIN }));
    expect(allowed.headers.get("access-control-allow-origin")).toBe(SEO_ORIGIN);

    const blocked = await route.POST(post(valid, { origin: "https://evil.example" }));
    expect(blocked.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("answers CORS preflight with 204 and the allowlist headers", async () => {
    const { route } = await loadRoute();
    const res = await route.OPTIONS(
      new Request("http://localhost/api/lead", { method: "OPTIONS", headers: { origin: SEO_ORIGIN } })
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe(SEO_ORIGIN);
  });
});
