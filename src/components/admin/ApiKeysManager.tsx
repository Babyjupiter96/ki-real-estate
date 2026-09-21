"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiKey } from "@/lib/db";

export function ApiKeysManager({ initialKeys }: { initialKeys: ApiKey[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"read" | "read_write">("read");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, scope }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create key.");
        return;
      }
      setNewKey(data.key);
      setCopied(false);
      setName("");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(key: ApiKey) {
    if (!confirm(`Revoke "${key.name}"? Anything using it will stop working immediately.`)) return;
    await fetch(`/api/admin/api-keys/${key.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl text-paper">API Keys</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone">
        Keys let other tools read or create contacts through the Ki API without a
        login. Each key is shown once when created, only a hash is stored, and any
        key can be revoked instantly.
      </p>

      {newKey && (
        <div className="mt-6 rounded-2xl border border-line-strong bg-ink-2 p-5">
          <p className="text-sm font-semibold text-paper">
            Copy this key now — you won&apos;t be able to see it again.
          </p>
          <code className="mt-3 block break-all rounded-lg bg-ink px-3.5 py-3 text-sm text-paper">
            {newKey}
          </code>
          <div className="mt-3 flex gap-3">
            <button
              onClick={copyKey}
              className="rounded-full bg-signal px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink hover:bg-[#dcdcdc]"
            >
              {copied ? "Copied" : "Copy key"}
            </button>
            <button
              onClick={() => setNewKey(null)}
              className="rounded-full px-4 py-2 text-xs text-stone hover:text-paper"
            >
              I&apos;ve saved it
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-line-strong bg-ink-2 p-5"
      >
        <label className="flex-1 min-w-[200px]">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone">
            Key name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Zapier integration"
            className="w-full rounded-lg border border-line-strong bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-signal"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone">
            Access
          </span>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as "read" | "read_write")}
            className="rounded-lg border border-line-strong bg-ink px-3 py-2.5 text-sm text-paper outline-none focus:border-signal"
          >
            <option value="read">Read only</option>
            <option value="read_write">Read &amp; write</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-ink hover:bg-[#dcdcdc] disabled:opacity-40"
        >
          {loading ? "Creating…" : "Create key"}
        </button>
        {error && <p className="w-full text-sm text-red-400">{error}</p>}
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line-strong bg-ink-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-stone">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Key</th>
              <th className="px-5 py-3 font-medium">Access</th>
              <th className="px-5 py-3 font-medium">Requests</th>
              <th className="px-5 py-3 font-medium">Last used</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {initialKeys.map((k) => (
              <tr key={k.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 text-paper">{k.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-stone">{k.key_prefix}…</td>
                <td className="px-5 py-3 text-stone">
                  {k.scope === "read_write" ? "Read & write" : "Read only"}
                </td>
                <td className="px-5 py-3 text-stone">{k.request_count}</td>
                <td className="px-5 py-3 text-stone">
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never"}
                </td>
                <td className="px-5 py-3 text-right">
                  {k.revoked_at ? (
                    <span className="text-xs text-stone-dark">Revoked</span>
                  ) : (
                    <button
                      onClick={() => handleRevoke(k)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {initialKeys.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-stone-dark" colSpan={6}>
                  No API keys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-2xl border border-line-strong bg-ink-2 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone">Usage</h2>
        <pre className="mt-3 overflow-x-auto text-xs text-paper/80">{`curl https://YOUR-SITE/api/v1/contacts \\
  -H "Authorization: Bearer ki_live_..."

curl -X POST https://YOUR-SITE/api/v1/contacts \\
  -H "Authorization: Bearer ki_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Jane Doe","email":"jane@example.com"}'`}</pre>
      </div>
    </div>
  );
}
