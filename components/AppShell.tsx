"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useState } from "react";

type Props = {
  userEmail: string | null;
  role: "creator" | "brand" | "admin";
  children: React.ReactNode;
};

export default function AppShell({ userEmail, role, children }: Props) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const links =
    role === "brand"
      ? [
          { href: "/vitrine", label: "Vitrine" },
          { href: "/dashboard/brand", label: "Painel" },
          { href: "/dashboard/brand/campaigns", label: "Campanhas" },
          { href: "/dashboard/brand/agreements", label: "Acordos" },
          { href: "/dashboard/brand/inquiries", label: "Pedidos enviados" },
        ]
      : role === "creator"
      ? [
          { href: "/dashboard/creator", label: "Painel" },
          { href: "/dashboard/creator/campaigns", label: "Campanhas abertas" },
          { href: "/dashboard/creator/agreements", label: "Meus acordos" },
          { href: "/dashboard/creator/offers", label: "Minhas ofertas" },
          { href: "/dashboard/creator/inquiries", label: "Pedidos recebidos" },
        ]
      : [{ href: "/dashboard/admin", label: "Admin" }];

  async function logout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="font-semibold">
            CreatorAds Hub
          </Link>

          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <span className="hidden sm:inline">{userEmail}</span>
            <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-xs">
              {role.toUpperCase()}
            </span>
            <button
              onClick={logout}
              disabled={loading}
              className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
            >
              {loading ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800/60"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
