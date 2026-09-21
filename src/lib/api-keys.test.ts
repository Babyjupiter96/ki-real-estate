import { createHash } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ query: vi.fn(), queryOne: vi.fn() }));

import { authenticateApiKey, createApiKey, revokeApiKey } from "./api-keys";
import { query, queryOne } from "./db";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const requestWith = (authorization?: string) =>
  new Request("http://localhost/api/v1/contacts", {
    headers: authorization ? { authorization } : {},
  });
const keyRecord = (scope: "read" | "read_write") => ({
  id: 1,
  name: "test",
  key_prefix: "ki_live_abcd",
  scope,
  created_at: "2026-01-01",
  last_used_at: null,
  revoked_at: null,
  request_count: 1,
});

beforeEach(() => {
  vi.mocked(query).mockReset();
  vi.mocked(queryOne).mockReset();
});

describe("createApiKey", () => {
  it("returns a prefixed, high-entropy key and stores only its hash", async () => {
    vi.mocked(queryOne).mockResolvedValue(keyRecord("read"));

    const { key } = await createApiKey("Zapier", "read");

    expect(key).toMatch(/^ki_live_[A-Za-z0-9_-]{32}$/);

    const [sql, params] = vi.mocked(queryOne).mock.calls[0];
    expect(params).toEqual(["Zapier", key.slice(0, 12), sha256(key), "read"]);
    expect(String(sql)).not.toContain(key);
    expect(JSON.stringify(params)).not.toContain(key.slice(12));
  });

  it("generates a different key every time", async () => {
    vi.mocked(queryOne).mockResolvedValue(keyRecord("read"));
    const keys = await Promise.all(
      Array.from({ length: 20 }, () => createApiKey("k", "read").then((r) => r.key))
    );
    expect(new Set(keys).size).toBe(20);
  });
});

describe("authenticateApiKey", () => {
  it.each([undefined, "Basic abc123", "Bearer", "Bearer ", "token ki_live_x"])(
    "rejects a missing or malformed Authorization header (%j) without touching the database",
    async (header) => {
      const result = await authenticateApiKey(requestWith(header), "read");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(401);
      expect(queryOne).not.toHaveBeenCalled();
    }
  );

  it("looks the key up by its hash, never by the raw value", async () => {
    vi.mocked(queryOne).mockResolvedValue(keyRecord("read"));
    await authenticateApiKey(requestWith("Bearer ki_live_secretvalue"), "read");
    const [, params] = vi.mocked(queryOne).mock.calls[0];
    expect(params).toEqual([sha256("ki_live_secretvalue")]);
  });

  it("only matches keys that have not been revoked", async () => {
    vi.mocked(queryOne).mockResolvedValue(undefined);
    await authenticateApiKey(requestWith("Bearer ki_live_x"), "read");
    expect(String(vi.mocked(queryOne).mock.calls[0][0])).toContain("revoked_at IS NULL");
  });

  it("accepts a valid key, case-insensitively on the scheme", async () => {
    vi.mocked(queryOne).mockResolvedValue(keyRecord("read"));
    const result = await authenticateApiKey(requestWith("bearer ki_live_x"), "read");
    expect(result.ok).toBe(true);
  });

  it("returns 401 for an unknown or revoked key", async () => {
    vi.mocked(queryOne).mockResolvedValue(undefined);
    const result = await authenticateApiKey(requestWith("Bearer ki_live_nope"), "read");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      expect(await result.response.json()).toEqual({ error: "Invalid or revoked API key." });
    }
  });

  it("returns 403 when a read-only key is used for a write", async () => {
    vi.mocked(queryOne).mockResolvedValue(keyRecord("read"));
    const result = await authenticateApiKey(requestWith("Bearer ki_live_x"), "write");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
  });

  it("allows a read_write key to read and write", async () => {
    vi.mocked(queryOne).mockResolvedValue(keyRecord("read_write"));
    expect((await authenticateApiKey(requestWith("Bearer ki_live_x"), "read")).ok).toBe(true);
    expect((await authenticateApiKey(requestWith("Bearer ki_live_x"), "write")).ok).toBe(true);
  });

  it("records usage (last-used time and request count) on successful lookup", async () => {
    vi.mocked(queryOne).mockResolvedValue(keyRecord("read"));
    await authenticateApiKey(requestWith("Bearer ki_live_x"), "read");
    const sql = String(vi.mocked(queryOne).mock.calls[0][0]);
    expect(sql).toContain("last_used_at = now()");
    expect(sql).toContain("request_count = request_count + 1");
  });
});

describe("revokeApiKey", () => {
  it("revokes by id and leaves already-revoked keys untouched", async () => {
    await revokeApiKey(7);
    const [sql, params] = vi.mocked(query).mock.calls[0];
    expect(String(sql)).toContain("revoked_at IS NULL");
    expect(params).toEqual([7]);
  });
});
