import { describe, expect, it } from "vitest";
import { describeEvent } from "./event-format";

const event = (type: string, meta: object | string = {}, path = "/") => ({
  type,
  path,
  meta: typeof meta === "string" ? meta : JSON.stringify(meta),
});

describe("describeEvent", () => {
  it("describes a page view with referrer host, device, and site", () => {
    const out = describeEvent(
      event("page_view", { referrer: "https://www.google.com/search?q=x", device: "mobile", site: "real-estate" }, "/")
    );
    expect(out.label).toBe("Viewed /");
    expect(out.detail).toBe("Real Estate site · from www.google.com · mobile");
  });

  it("calls a page view with no referrer a direct visit", () => {
    expect(describeEvent(event("page_view", { device: "desktop" })).detail).toContain("direct visit");
  });

  it("includes the UTM source when present", () => {
    expect(describeEvent(event("page_view", { utm_source: "newsletter" })).detail).toContain("utm: newsletter");
  });

  it("names the SEO site", () => {
    expect(describeEvent(event("page_view", { site: "seo" })).detail).toContain("SEO site");
  });

  it("describes CTA clicks by button id", () => {
    expect(describeEvent(event("cta_click", { id: "talk_to_ki_nav" })).label).toBe('Clicked "talk_to_ki_nav"');
  });

  it("describes form start, step, and submit", () => {
    expect(describeEvent(event("form_start", { intent: "sell" }))).toEqual({
      label: "Opened the contact form",
      detail: "intent: sell",
    });
    expect(describeEvent(event("form_step", { step: "property" })).label).toBe("Completed form step: property");
    expect(describeEvent(event("form_submit")).label).toBe("Submitted the form");
  });

  it("does not throw on malformed metadata", () => {
    expect(() => describeEvent(event("page_view", "{not json"))).not.toThrow();
    expect(describeEvent(event("cta_click", "{not json")).label).toBe('Clicked "a button"');
  });

  it("falls back to the raw type for unknown events", () => {
    expect(describeEvent(event("something_new")).label).toBe("something_new");
  });

  it("uses the raw value when a referrer is not a valid URL", () => {
    expect(describeEvent(event("page_view", { referrer: "not a url" })).detail).toContain("from not a url");
  });
});
