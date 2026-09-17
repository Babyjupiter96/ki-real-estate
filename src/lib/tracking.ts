"use client";

const SESSION_KEY = "ki_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function track(
  type: "page_view" | "cta_click" | "form_start" | "form_step" | "form_submit",
  meta: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      type,
      path: window.location.pathname,
      sessionId: getSessionId(),
      meta,
    });
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking must never break the page.
  }
}
