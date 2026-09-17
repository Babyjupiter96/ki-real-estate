"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Contact, ContactActivity, ContactNote, ContactStatus } from "@/lib/db";
import { StatusBadge } from "./StatusBadge";

const STATUSES: ContactStatus[] = ["new", "contacted", "qualified", "won", "lost"];

export function ContactDetail({
  contact,
  initialNotes,
  initialActivity,
}: {
  contact: Contact;
  initialNotes: ContactNote[];
  initialActivity: ContactActivity[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(contact.status);
  const [followUp, setFollowUp] = useState(toDateInput(contact.next_follow_up_at));
  const [notes, setNotes] = useState(initialNotes);
  const [noteBody, setNoteBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  async function saveField(patch: Record<string, string | null>) {
    setSaving(true);
    try {
      await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteBody.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: noteBody }),
      });
      const data = await res.json();
      setNotes(data.notes);
      setNoteBody("");
      router.refresh();
    } finally {
      setAddingNote(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete ${contact.name || "this contact"}? This can't be undone.`)) return;
    await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
    router.push("/admin/contacts");
    router.refresh();
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-paper">{contact.name || "Unnamed contact"}</h1>
          <p className="mt-1 text-sm text-stone">
            {contact.source === "lead_form" ? "Website lead" : "Manually added"} ·{" "}
            {new Date(contact.created_at).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Section title="Contact Info">
            <Field label="Email" value={contact.email} />
            <Field label="Phone" value={contact.phone} />
            <Field label="Company" value={contact.company} />
            <Field label="Website" value={contact.website} />
            <Field label="Intent" value={contact.intent ?? "—"} />
          </Section>

          {(contact.property_address || contact.property_type) && (
            <Section title="Property Details">
              <Field label="Address" value={contact.property_address} />
              <Field label="Type" value={contact.property_type} />
              <Field label="Estimated Value" value={contact.estimated_value} />
              <Field label="Timeline" value={contact.timeline} />
            </Section>
          )}

          {(contact.industry || contact.seo_situation || contact.budget) && (
            <Section title="Business / SEO Details">
              <Field label="Industry" value={contact.industry} />
              <Field label="Current SEO Situation" value={contact.seo_situation} />
              <Field label="Monthly Budget" value={contact.budget} />
            </Section>
          )}

          {contact.message && (
            <Section title="Message">
              <p className="text-sm text-paper/90">{contact.message}</p>
            </Section>
          )}

          <Section title="Notes">
            <form onSubmit={handleAddNote} className="mb-4 flex gap-2">
              <input
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Add a note…"
                className="flex-1 rounded-lg border border-line-strong bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-signal"
              />
              <button
                type="submit"
                disabled={addingNote}
                className="rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-ink hover:bg-[#dcdcdc] disabled:opacity-50"
              >
                Add
              </button>
            </form>
            <ul className="space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="rounded-lg bg-ink px-3.5 py-2.5 text-sm">
                  <p className="text-paper/90">{n.body}</p>
                  <p className="mt-1 text-xs text-stone-dark">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
              {notes.length === 0 && (
                <p className="text-sm text-stone-dark">No notes yet.</p>
              )}
            </ul>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Manage">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                const value = e.target.value as ContactStatus;
                setStatus(value);
                saveField({ status: value });
              }}
              className="mb-4 w-full rounded-lg border border-line-strong bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-signal"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone">
              Next Follow-Up
            </label>
            <input
              type="date"
              value={followUp}
              onChange={(e) => {
                setFollowUp(e.target.value);
                saveField({
                  next_follow_up_at: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                  last_reminder_sent_at: null,
                });
              }}
              className="mb-4 w-full rounded-lg border border-line-strong bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-signal"
            />

            <button
              onClick={() =>
                saveField({ last_contacted_at: new Date().toISOString() })
              }
              disabled={saving}
              className="mb-3 w-full rounded-lg border border-line-strong px-3.5 py-2.5 text-sm text-paper hover:border-signal hover:text-signal disabled:opacity-50"
            >
              Mark Contacted Today
            </button>
            {contact.last_contacted_at && (
              <p className="mb-4 text-xs text-stone-dark">
                Last contacted {new Date(contact.last_contacted_at).toLocaleString()}
              </p>
            )}

            <button
              onClick={handleDelete}
              className="w-full rounded-lg border border-red-900/50 px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-950/30"
            >
              Delete Contact
            </button>
          </Section>

          <Section title="Activity">
            <ul className="space-y-2">
              {initialActivity.map((a) => (
                <li key={a.id} className="text-xs text-stone">
                  <span className="text-paper/70">{formatActivity(a.type)}</span>{" "}
                  · {new Date(a.created_at).toLocaleString()}
                </li>
              ))}
              {initialActivity.length === 0 && (
                <p className="text-sm text-stone-dark">No activity yet.</p>
              )}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line-strong bg-ink-2 p-5">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between border-b border-line py-2 text-sm last:border-0">
      <span className="text-stone">{label}</span>
      <span className="text-paper/90">{value}</span>
    </div>
  );
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function formatActivity(type: string): string {
  return type.replace(/_/g, " ");
}
