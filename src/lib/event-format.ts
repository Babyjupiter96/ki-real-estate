export type EventLike = { type: string; path: string; meta: string };

type Meta = {
  id?: string;
  step?: string;
  intent?: string | null;
  referrer?: string;
  device?: string;
  site?: string;
  utm_source?: string;
};

function parseMeta(raw: string): Meta {
  try {
    return JSON.parse(raw) as Meta;
  } catch {
    return {};
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

const SITE_LABELS: Record<string, string> = {
  "real-estate": "Real Estate site",
  seo: "SEO site",
};

export function describeEvent(e: EventLike): { label: string; detail: string } {
  const meta = parseMeta(e.meta);
  const details: string[] = [];
  if (meta.site) details.push(SITE_LABELS[meta.site] ?? meta.site);

  switch (e.type) {
    case "page_view": {
      if (meta.referrer) details.push(`from ${hostOf(meta.referrer)}`);
      else details.push("direct visit");
      if (meta.utm_source) details.push(`utm: ${meta.utm_source}`);
      if (meta.device) details.push(meta.device);
      return { label: `Viewed ${e.path || "/"}`, detail: details.join(" · ") };
    }
    case "cta_click":
      return { label: `Clicked "${meta.id ?? "a button"}"`, detail: details.join(" · ") };
    case "form_start":
      if (meta.intent) details.push(`intent: ${meta.intent}`);
      return { label: "Opened the contact form", detail: details.join(" · ") };
    case "form_step":
      return { label: `Completed form step: ${meta.step ?? "?"}`, detail: details.join(" · ") };
    case "form_submit":
      return { label: "Submitted the form", detail: details.join(" · ") };
    default:
      return { label: e.type, detail: details.join(" · ") };
  }
}
