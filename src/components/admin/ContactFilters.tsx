"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"];
const INTENTS = ["sell", "grow", "both", "other"];

export function ContactFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam("search", search || null);
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, company…"
          className="w-64 rounded-lg border border-line-strong bg-ink-2 px-3.5 py-2 text-sm text-paper outline-none focus:border-signal"
        />
      </form>

      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value || null)}
        className="rounded-lg border border-line-strong bg-ink-2 px-3 py-2 text-sm text-paper outline-none focus:border-signal"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("intent") ?? ""}
        onChange={(e) => setParam("intent", e.target.value || null)}
        className="rounded-lg border border-line-strong bg-ink-2 px-3 py-2 text-sm text-paper outline-none focus:border-signal"
      >
        <option value="">All intents</option>
        {INTENTS.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("source") ?? ""}
        onChange={(e) => setParam("source", e.target.value || null)}
        className="rounded-lg border border-line-strong bg-ink-2 px-3 py-2 text-sm text-paper outline-none focus:border-signal"
      >
        <option value="">All sources</option>
        <option value="lead_form">Website lead</option>
        <option value="manual">Manually added</option>
      </select>

      {(searchParams.get("status") ||
        searchParams.get("intent") ||
        searchParams.get("source") ||
        searchParams.get("search")) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-stone hover:text-signal"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
