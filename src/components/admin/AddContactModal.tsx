"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddContactModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Failed to add contact.");
        return;
      }
      setForm({ name: "", email: "", phone: "", company: "", notes: "" });
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-signal px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink hover:bg-[#dcdcdc]"
      >
        + Add Contact
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-md rounded-2xl border border-line-strong bg-ink-2 p-7"
          >
            <h3 className="mb-5 font-serif text-2xl text-paper">Add Contact</h3>
            <div className="grid gap-3">
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="rounded-lg border border-line-strong bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-signal"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="rounded-lg border border-line-strong bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-signal"
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="rounded-lg border border-line-strong bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-signal"
              />
              <input
                placeholder="Company"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                className="rounded-lg border border-line-strong bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-signal"
              />
              <textarea
                placeholder="Notes"
                rows={3}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className="rounded-lg border border-line-strong bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-signal"
              />
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-sm text-stone hover:text-paper"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-signal px-5 py-2 text-sm font-semibold text-ink hover:bg-[#dcdcdc] disabled:opacity-50"
              >
                {loading ? "Adding…" : "Add Contact"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
