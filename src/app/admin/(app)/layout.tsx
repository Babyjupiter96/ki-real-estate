import Link from "next/link";
import type { Metadata } from "next";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: "Ki CRM",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-line bg-ink-2 md:flex md:flex-col">
          <div className="px-6 py-6">
            <span className="font-serif text-xl text-paper">
              KI<span className="text-signal">.</span>{" "}
              <span className="text-sm font-sans text-stone">CRM</span>
            </span>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-3">
            <NavLink href="/admin">Dashboard</NavLink>
            <NavLink href="/admin/contacts">Contacts</NavLink>
            <NavLink href="/admin/api-keys">API Keys</NavLink>
          </nav>
          <div className="border-t border-line px-3 py-4">
            <LogoutButton />
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-line px-5 py-4 md:hidden">
            <span className="font-serif text-lg text-paper">
              KI<span className="text-signal">.</span> CRM
            </span>
            <LogoutButton />
          </header>
          <main className="flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone transition-colors hover:bg-ink-3 hover:text-paper"
    >
      {children}
    </Link>
  );
}
