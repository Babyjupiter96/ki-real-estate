import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkPassword, createSessionToken, verifySessionToken } from "./auth";

const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  vi.stubEnv("ADMIN_SESSION_SECRET", "test-secret-value");
  vi.stubEnv("ADMIN_PASSWORD", "correct horse battery");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("session tokens", () => {
  it("creates a token shaped like <expiry>.<64-char hex signature>", async () => {
    const token = await createSessionToken();
    expect(token).toMatch(/^\d+\.[0-9a-f]{64}$/);
  });

  it("verifies a freshly created token", async () => {
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
  });

  it.each([undefined, "", "garbage", "123.", ".abc", "abc.def", "1.2.3"])(
    "rejects malformed token %j",
    async (token) => {
      expect(await verifySessionToken(token)).toBe(false);
    }
  );

  it("rejects a token whose signature was altered", async () => {
    const token = await createSessionToken();
    const [expiry, sig] = token.split(".");
    const flipped = (sig[0] === "0" ? "1" : "0") + sig.slice(1);
    expect(await verifySessionToken(`${expiry}.${flipped}`)).toBe(false);
  });

  it("rejects a token whose expiry was extended without re-signing", async () => {
    const token = await createSessionToken();
    const [expiry, sig] = token.split(".");
    const extended = String(Number(expiry) + 365 * DAY);
    expect(await verifySessionToken(`${extended}.${sig}`)).toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken();
    vi.stubEnv("ADMIN_SESSION_SECRET", "a-different-secret");
    expect(await verifySessionToken(token)).toBe(false);
  });

  it("accepts a token within its 7-day lifetime and rejects it afterward", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = await createSessionToken();

    vi.setSystemTime(new Date("2026-01-01T00:00:00Z").getTime() + 6 * DAY);
    expect(await verifySessionToken(token)).toBe(true);

    vi.setSystemTime(new Date("2026-01-01T00:00:00Z").getTime() + 8 * DAY);
    expect(await verifySessionToken(token)).toBe(false);
  });

  it("refuses to create or verify tokens when the secret is not configured", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    await expect(createSessionToken()).rejects.toThrow(/ADMIN_SESSION_SECRET/);
    // A non-expired-looking token, so verification reaches the secret lookup.
    await expect(verifySessionToken(`${Date.now() + DAY}.abc`)).rejects.toThrow(/ADMIN_SESSION_SECRET/);
  });
});

describe("checkPassword", () => {
  it("accepts the correct password", () => {
    expect(checkPassword("correct horse battery")).toBe(true);
  });

  it("rejects a wrong password of the same length", () => {
    expect(checkPassword("correct horse batterz")).toBe(false);
  });

  it("rejects passwords of a different length", () => {
    expect(checkPassword("correct horse")).toBe(false);
    expect(checkPassword("correct horse battery!")).toBe(false);
  });

  it("rejects an empty candidate", () => {
    expect(checkPassword("")).toBe(false);
  });

  it("rejects everything when no admin password is configured", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(checkPassword("")).toBe(false);
    expect(checkPassword("anything")).toBe(false);
  });
});
