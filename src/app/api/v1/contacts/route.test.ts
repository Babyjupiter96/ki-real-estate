import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/api-keys", () => ({ authenticateApiKey: vi.fn() }));
vi.mock("@/lib/contacts", () => ({ listContacts: vi.fn(), createContact: vi.fn() }));

import { GET, POST } from "./route";
import { authenticateApiKey } from "@/lib/api-keys";
import { createContact, listContacts } from "@/lib/contacts";

const allow = () =>
  vi.mocked(authenticateApiKey).mockResolvedValue({ ok: true, key: {} as never });
const deny = (status: number) =>
  vi.mocked(authenticateApiKey).mockResolvedValue({
    ok: false,
    response: NextResponse.json({ error: "nope" }, { status }),
  });

const get = (qs = "") => new Request(`http://localhost/api/v1/contacts${qs}`);
const post = (body: unknown) =>
  new Request("http://localhost/api/v1/contacts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listContacts).mockResolvedValue({ contacts: [], total: 0 });
  vi.mocked(createContact).mockResolvedValue({ id: 5, name: "Jane" } as never);
});

describe("GET /api/v1/contacts", () => {
  it("requires a read-scoped key and returns its rejection unchanged", async () => {
    deny(401);
    const res = await GET(get());
    expect(res.status).toBe(401);
    expect(authenticateApiKey).toHaveBeenCalledWith(expect.any(Request), "read");
    expect(listContacts).not.toHaveBeenCalled();
  });

  it("passes filters through to the query", async () => {
    allow();
    await GET(get("?status=new&intent=sell&search=jane&limit=10&offset=20"));
    expect(listContacts).toHaveBeenCalledWith({
      status: "new",
      intent: "sell",
      search: "jane",
      limit: 10,
      offset: 20,
    });
  });

  it("caps the page size at 200 and defaults to 50", async () => {
    allow();
    await GET(get("?limit=999999"));
    expect(vi.mocked(listContacts).mock.calls[0][0]).toMatchObject({ limit: 200 });
    await GET(get());
    expect(vi.mocked(listContacts).mock.calls[1][0]).toMatchObject({ limit: 50, offset: 0 });
  });
});

describe("POST /api/v1/contacts", () => {
  it("requires a write-scoped key and stores nothing when it is rejected", async () => {
    deny(403);
    const res = await POST(post({ name: "Jane" }));
    expect(res.status).toBe(403);
    expect(authenticateApiKey).toHaveBeenCalledWith(expect.any(Request), "write");
    expect(createContact).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON with 400", async () => {
    allow();
    expect((await POST(post("{bad"))).status).toBe(400);
  });

  it.each([{}, { name: "" }, { name: "   " }, { name: 42 }])(
    "requires a non-empty string name (%j)",
    async (body) => {
      allow();
      const res = await POST(post(body));
      expect(res.status).toBe(422);
      expect(createContact).not.toHaveBeenCalled();
    }
  );

  it("creates a manual contact and returns 201", async () => {
    allow();
    const res = await POST(post({ name: " Jane ", email: "j@example.com", intent: "sell" }));
    expect(res.status).toBe(201);
    expect(createContact).toHaveBeenCalledWith(
      expect.objectContaining({ source: "manual", name: "Jane", email: "j@example.com", intent: "sell" })
    );
  });

  it("ignores non-string optional fields rather than storing them", async () => {
    allow();
    await POST(post({ name: "Jane", email: { $gt: "" }, phone: 5551234 }));
    expect(createContact).toHaveBeenCalledWith(expect.objectContaining({ email: "", phone: "" }));
  });
});
