import { afterEach, describe, expect, it, vi } from "vitest";

// ALLOWED_ORIGINS is read when the module loads, so each test sets it first
// and imports a fresh copy.
async function loadWith(allowed: string | undefined) {
  vi.resetModules();
  if (allowed === undefined) vi.unstubAllEnvs();
  else vi.stubEnv("ALLOWED_ORIGINS", allowed);
  return (await import("./cors")).corsHeaders;
}

afterEach(() => vi.unstubAllEnvs());

describe("corsHeaders", () => {
  it("allows an origin on the allowlist and echoes it back", async () => {
    const corsHeaders = await loadWith("https://seo.example.com");
    expect(corsHeaders("https://seo.example.com")).toMatchObject({
      "Access-Control-Allow-Origin": "https://seo.example.com",
      Vary: "Origin",
    });
  });

  it("returns no CORS headers for an origin that is not allowed", async () => {
    const corsHeaders = await loadWith("https://seo.example.com");
    expect(corsHeaders("https://evil.example")).toEqual({});
  });

  it("does not allow a look-alike origin", async () => {
    const corsHeaders = await loadWith("https://seo.example.com");
    expect(corsHeaders("https://seo.example.com.evil.io")).toEqual({});
    expect(corsHeaders("http://seo.example.com")).toEqual({});
  });

  it("returns no headers when there is no Origin header", async () => {
    const corsHeaders = await loadWith("https://seo.example.com");
    expect(corsHeaders(null)).toEqual({});
  });

  it("supports several comma-separated origins and ignores whitespace", async () => {
    const corsHeaders = await loadWith(" https://a.example.com , https://b.example.com ");
    expect(corsHeaders("https://a.example.com")).toHaveProperty("Access-Control-Allow-Origin");
    expect(corsHeaders("https://b.example.com")).toHaveProperty("Access-Control-Allow-Origin");
  });

  it("allows nothing when ALLOWED_ORIGINS is unset", async () => {
    const corsHeaders = await loadWith(undefined);
    expect(corsHeaders("https://anything.example.com")).toEqual({});
  });
});
