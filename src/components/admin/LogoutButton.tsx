"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-lg border border-line-strong px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone transition-colors hover:border-signal hover:text-signal"
    >
      Log Out
    </button>
  );
}
