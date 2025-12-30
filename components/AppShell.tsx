"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import { getPublicUrl } from "@/lib/supabase/storage";
import Image from "next/image";

type Props = {
  userEmail: string | null;
  role: "creator" | "brand" | "admin";
  children: React.ReactNode;
};

export default function AppShell({ userEmail, role, children }: Props) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  const links =
    role === "brand"
      ? [
          { href: "/dashboard/brand", label: "Painel", icon: "home" },
          { href: "/vitrine", label: "Vitrine", icon: "grid" },
          { href: "/dashboard/brand/inquiries", label: "Pedidos de proposta", icon: "inbox" },
          { href: "/dashboard/brand/partnerships", label: "Parcerias", icon: "flag" },
          { href: "/dashboard/settings", label: "Configuracoes", icon: "settings" },
        ]
      : role === "creator"
      ? [
          { href: "/dashboard/creator", label: "Painel", icon: "home" },
          { href: "/dashboard/creator/offers", label: "Minhas ofertas", icon: "tag" },
          { href: "/dashboard/creator/inquiries", label: "Pedidos de proposta", icon: "inbox" },
          { href: "/dashboard/creator/partnerships", label: "Parcerias", icon: "flag" },
          { href: "/dashboard/settings", label: "Configuracoes", icon: "settings" },
        ]
      : [
          { href: "/dashboard/admin", label: "Admin", icon: "shield" },
          { href: "/dashboard/settings", label: "Configuracoes", icon: "settings" },
        ];

  const mobileLinks = links.slice(0, 4);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name,avatar_path")
        .eq("id", user.id)
        .single();

      setDisplayName(profile?.display_name ?? null);
      setAvatarPath(profile?.avatar_path ?? null);
    }

    loadProfile();
  }, [supabase]);

  async function logout() {
    if (!window.confirm("Deseja sair?")) return;
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-900">
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/brand/icon.svg"
              alt="CreatorHub"
              width={40}
              height={40}
              className="h-10 w-10 rounded-2xl border border-slate-200 bg-white p-1"
            />
            <div>
              <div className="text-sm font-semibold text-slate-900">CreatorHub</div>
              <div className="text-xs text-slate-500">Creators e Patrocinadores</div>
            </div>
          </Link>

          <div className="hidden md:block md:w-72">
            <Input placeholder="Pesquisar creators, cidades..." aria-label="Pesquisar" />
          </div>

          <div className="flex items-center gap-3">
            <Avatar
              name={displayName ?? userEmail ?? role}
              src={avatarPath ? getPublicUrl("avatars", avatarPath) : null}
            />
            <div className="hidden sm:flex flex-col text-xs text-slate-500">
              {displayName || userEmail ? (
                <span className="text-slate-800">{displayName ?? userEmail}</span>
              ) : (
                <Skeleton className="h-3 w-32" />
              )}
              <Badge variant="muted">{role.toUpperCase()}</Badge>
            </div>
            <Button onClick={logout} disabled={loading} size="sm" variant="secondary">
              {loading ? "Saindo..." : "Sair"}
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#FF0033] opacity-60" />
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-24 pt-24 md:grid-cols-[240px_1fr] md:pb-10">
        <aside className="hidden md:block">
          <Card className="sticky top-24 p-4">
            <nav className="flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-700 transition hover:border-slate-200 hover:bg-slate-100"
                >
                  <NavIcon name={l.icon} />
                  <span>{l.label}</span>
                </Link>
              ))}
            </nav>
          </Card>
        </aside>

        <main className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm md:p-6">
          {children}
        </main>
      </div>

      <nav className="fixed bottom-3 left-0 right-0 z-40 mx-auto w-[92%] max-w-md rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 shadow-md backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-2 text-xs">
          {mobileLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-slate-600 hover:bg-slate-100"
            >
              <NavIcon name={link.icon} />
              <span className="text-[10px]">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavIcon({ name }: { name?: string }) {
  const base = "h-4 w-4 text-slate-500";
  if (name === "grid") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
      </svg>
    );
  }
  if (name === "inbox") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 4h16v12H4z" />
        <path d="M4 16h5l2 3h2l2-3h5" />
      </svg>
    );
  }
  if (name === "flag") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M5 3v18" />
        <path d="M5 4h11l-2 4 2 4H5" />
      </svg>
    );
  }
  if (name === "tag") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M20 12l-8 8-9-9V4h7z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3l8 4v6c0 5-3.5 7.5-8 8-4.5-.5-8-3-8-8V7z" />
      </svg>
    );
  }
  if (name === "settings") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .35 2l.03.03a2 2 0 1 1-2.83 2.83l-.03-.03a1.8 1.8 0 0 0-2-.35 1.8 1.8 0 0 0-1 1.62V21a2 2 0 1 1-4 0v-.05a1.8 1.8 0 0 0-1-1.62 1.8 1.8 0 0 0-2 .35l-.03.03a2 2 0 1 1-2.83-2.83l.03-.03a1.8 1.8 0 0 0 .35-2 1.8 1.8 0 0 0-1.62-1H3a2 2 0 1 1 0-4h.05a1.8 1.8 0 0 0 1.62-1 1.8 1.8 0 0 0-.35-2l-.03-.03a2 2 0 1 1 2.83-2.83l.03.03a1.8 1.8 0 0 0 2 .35 1.8 1.8 0 0 0 1-1.62V3a2 2 0 1 1 4 0v.05a1.8 1.8 0 0 0 1 1.62 1.8 1.8 0 0 0 2-.35l.03-.03a2 2 0 1 1 2.83 2.83l-.03.03a1.8 1.8 0 0 0-.35 2 1.8 1.8 0 0 0 1.62 1H21a2 2 0 1 1 0 4h-.05a1.8 1.8 0 0 0-1.62 1z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 10l8-6 8 6v10H4z" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}
