const COLORS: Record<string, string> = {
  new: "bg-signal/15 text-signal",
  contacted: "bg-blue-500/15 text-blue-300",
  qualified: "bg-purple-500/15 text-purple-300",
  won: "bg-green-500/15 text-green-300",
  lost: "bg-red-500/15 text-red-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        COLORS[status] ?? "bg-ink-3 text-stone"
      }`}
    >
      {status}
    </span>
  );
}
