import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/analytics";
import { listContacts } from "@/lib/contacts";
import { RunFollowUpsButton } from "@/components/admin/RunFollowUpsButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { emailConfigured } from "@/lib/email";

// This page reads live CRM data on every request; it must never be
// served from a build-time static snapshot.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const summary = await getAnalyticsSummary();
  const { contacts: recent } = await listContacts({ limit: 8 });

  const statusCounts = Object.fromEntries(
    summary.totals.map((t) => [t.status, t.count])
  ) as Record<string, number>;

  const maxDaily = Math.max(1, ...summary.dailyPageViews.map((d) => d.count));

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-paper">Dashboard</h1>
        <RunFollowUpsButton />
      </div>

      {!emailConfigured && (
        <div className="mb-8 rounded-xl border border-line-strong bg-ink-2 px-4 py-3 text-sm text-stone">
          Email isn&apos;t configured yet — lead notifications and follow-up
          reminders are being logged but not sent. Add{" "}
          <code className="text-paper">GMAIL_USER</code> and{" "}
          <code className="text-paper">GMAIL_APP_PASSWORD</code> to{" "}
          <code className="text-paper">.env.local</code>.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Contacts" value={summary.total} />
        <StatCard label="New This Week" value={summary.newThisWeek} />
        <StatCard label="Follow-Ups Due" value={summary.dueFollowUps} accent />
        <StatCard label="Won" value={statusCounts.won ?? 0} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line-strong bg-ink-2 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone">
            Page Views — Last 14 Days
          </h2>
          {summary.dailyPageViews.length === 0 ? (
            <p className="text-sm text-stone-dark">No traffic recorded yet.</p>
          ) : (
            <div className="flex h-32 items-end gap-1.5">
              {summary.dailyPageViews.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-signal/80"
                    style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: 2 }}
                    title={`${d.day}: ${d.count}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line-strong bg-ink-2 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone">
            Top CTA Clicks — Last 30 Days
          </h2>
          {summary.ctaBreakdown.length === 0 ? (
            <p className="text-sm text-stone-dark">No clicks recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {summary.ctaBreakdown.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-paper/80">{c.id}</span>
                  <span className="text-stone">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-line-strong bg-ink-2">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone">
            Recent Contacts
          </h2>
          <Link href="/admin/contacts" className="text-xs text-signal hover:underline">
            View all →
          </Link>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {recent.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-6 py-3">
                  <Link
                    href={`/admin/contacts/${c.id}`}
                    className="font-medium text-paper hover:text-signal"
                  >
                    {c.name || "—"}
                  </Link>
                </td>
                <td className="px-6 py-3 text-stone">{c.email}</td>
                <td className="px-6 py-3 text-stone">{c.intent ?? "—"}</td>
                <td className="px-6 py-3">
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-stone-dark" colSpan={4}>
                  No contacts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line-strong bg-ink-2 p-5">
      <p className="text-xs uppercase tracking-wide text-stone">{label}</p>
      <p className={`mt-2 font-serif text-3xl ${accent ? "text-signal" : "text-paper"}`}>
        {value}
      </p>
    </div>
  );
}
