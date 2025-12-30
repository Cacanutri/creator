import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = supabaseServer();

  const [{ count: campaignCount }, { count: proposalCount }, { count: ratingCount }] = await Promise.all([
    supabase.from("campaigns").select("id", { count: "exact", head: true }),
    supabase.from("proposals").select("id", { count: "exact", head: true }),
    supabase.from("ratings").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold">Admin</h1>
      <p className="mt-1 text-sm text-zinc-300">Visao geral de campanhas, propostas e avaliacoes.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Link href="/dashboard/admin/campaigns" className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="text-xs text-zinc-400">Campanhas</div>
          <div className="mt-1 text-lg font-semibold text-zinc-100">{campaignCount ?? 0}</div>
        </Link>
        <Link href="/dashboard/admin/proposals" className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="text-xs text-zinc-400">Propostas</div>
          <div className="mt-1 text-lg font-semibold text-zinc-100">{proposalCount ?? 0}</div>
        </Link>
        <Link href="/dashboard/admin/ratings" className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="text-xs text-zinc-400">Avaliacoes</div>
          <div className="mt-1 text-lg font-semibold text-zinc-100">{ratingCount ?? 0}</div>
        </Link>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard/admin/moderation"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800/60"
        >
          Moderacao
        </Link>
      </div>
    </div>
  );
}
