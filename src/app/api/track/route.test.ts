import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ logPageEvent: vi.fn() }));

import { POST } from "./route";
import { logPageEvent } from "@/lib/db";

const post = (body: unknown) =>
  new Request("http://localhost/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

beforeEach(() => vi.clearAllMocks());

describe("POST /api/track", () => {
  it("rejects invalid JSON with 400", async () => {
    expect((await POST(post("{oops"))).status).toBe(400);
    expect(logPageEvent).not.toHaveBeenCalled();
  });

  it.each(["", "drop_table", "PAGE_VIEW", undefined])(
    "rejects the event type %j with 422",
    async (type) => {
      const res = await POST(post({ type, path: "/" }));
      expect(res.status).toBe(422);
      expect(logPageEvent).not.toHaveBeenCalled();
    }
  );

  it.each(["page_view", "cta_click", "form_start", "form_step", "form_submit"])(
    "accepts the %s event",
    async (type) => {
      const res = await POST(post({ type, path: "/x", sessionId: "s", meta: { a: 1 } }));
      expect(res.status).toBe(200);
      expect(logPageEvent).toHaveBeenCalledWith(type, "/x", "s", { a: 1 });
    }
  );

  it("truncates an oversized path and session id", async () => {
    await POST(post({ type: "page_view", path: "p".repeat(2000), sessionId: "s".repeat(500) }));
    const [, path, session] = vi.mocked(logPageEvent).mock.calls[0];
    expect(path).toHaveLength(500);
    expect(session).toHaveLength(100);
  });

  it("defaults missing fields instead of failing", async () => {
    const res = await POST(post({ type: "page_view" }));
    expect(res.status).toBe(200);
    expect(logPageEvent).toHaveBeenCalledWith("page_view", "", "", {});
  });
});
