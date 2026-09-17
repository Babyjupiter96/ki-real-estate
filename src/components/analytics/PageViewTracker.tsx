"use client";

import { useEffect } from "react";
import { track } from "@/lib/tracking";

export function PageViewTracker() {
  useEffect(() => {
    track("page_view");

    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-track]");
      if (target) {
        track("cta_click", { id: target.dataset.track });
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
