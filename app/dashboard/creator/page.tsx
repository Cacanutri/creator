import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function CreatorHome() {
  const supabase = supabaseServer();
  const { data: openCampaigns } = await supabase
    .from("campaigns")
    .select("id,title,status,created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold">Painel do Creator</h1>
        <p className="mt-1 text-sm text-zinc-300">Escolha campanhas abertas e envie propostas.</p>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/dashboard/creator/campaigns"
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          Ver campanhas abertas
        </Link>
        <Link
          href="/dashboard/creator/agreements"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800/60"
        >
          Meus acordos
        </Link>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Abertas agora</h2>
      <div className="mt-3 grid gap-2">
        {(openCampaigns ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/creator/campaigns/${c.id}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 hover:bg-zinc-900/50"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-zinc-300">{String(c.status).toUpperCase()}</div>
            </div>
          </Link>
        ))}
        {(!openCampaigns || openCampaigns.length === 0) && (
          <div className="text-sm text-zinc-300">Sem campanhas abertas no momento.</div>
        )}
      </div>
    </div>
  );
}