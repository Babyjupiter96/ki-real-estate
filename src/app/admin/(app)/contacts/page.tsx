import { Suspense } from "react";
import Link from "next/link";
import { listContacts } from "@/lib/contacts";
import type { ContactStatus } from "@/lib/db";
import { ContactFilters } from "@/components/admin/ContactFilters";
import { AddContactModal } from "@/components/admin/AddContactModal";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  status?: string;
  intent?: string;
  source?: string;
  search?: string;
}>;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { contacts, total } = await listContacts({
    status: (params.status as ContactStatus) || undefined,
    intent: params.intent || undefined,
    source: params.source || undefined,
    search: params.search || undefined,
    limit: 100,
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-paper">
          Contacts <span className="text-lg text-stone">({total})</span>
        </h1>
        <AddContactModal />
      </div>

      <Suspense>
        <ContactFilters />
      </Suspense>

      <div className="overflow-x-auto rounded-2xl border border-line-strong bg-ink-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-stone">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Intent</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Follow-Up</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-ink-3/50">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/contacts/${c.id}`}
                    className="font-medium text-paper hover:text-signal"
                  >
                    {c.name || "—"}
                  </Link>
                </td>
                <td className="px-5 py-3 text-stone">{c.email || "—"}</td>
                <td className="px-5 py-3 text-stone">{c.intent ?? "—"}</td>
                <td className="px-5 py-3 text-stone">
                  {c.source === "lead_form" ? "Website" : "Manual"}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-5 py-3 text-stone">
                  {c.next_follow_up_at
                    ? new Date(c.next_follow_up_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-5 py-3 text-stone">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-stone-dark" colSpan={7}>
                  No contacts match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
