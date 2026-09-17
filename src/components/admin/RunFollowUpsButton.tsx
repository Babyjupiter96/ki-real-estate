"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RunFollowUpsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/run-follow-ups", { method: "POST" });
      const data = await res.json();
      setResult(
        data.checked === 0
          ? "Nothing due right now."
          : `Checked ${data.checked}, sent ${data.sent} reminder(s).`
      );
      router.refresh();
    } catch {
      setResult("Failed to run scan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={loading}
        className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
      >
        {loading ? "Checking…" : "Run Follow-Up Scan Now"}
      </button>
      {result && <span className="text-xs text-stone">{result}</span>}
    </div>
  );
}
