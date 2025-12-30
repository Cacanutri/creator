import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminProposals() {
  const supabase = supabaseServer();
  const { data: proposals } = await supabase
    .from("proposals")
    .select("id,campaign_id,creator_id,price,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-xl font-semibold">Propostas</h1>
      <p className="mt-1 text-sm text-zinc-300">Todas as propostas enviadas por creators.</p>

      <div className="mt-4 grid gap-2">
        {(proposals ?? []).map((p) => (
          <div key={p.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">Campanha: {p.campaign_id}</div>
              <div className="text-xs text-zinc-300">{String(p.status).toUpperCase()}</div>
            </div>
            <div className="mt-1 text-xs text-zinc-400">Creator: {p.creator_id}</div>
            <div className="mt-1 text-xs text-zinc-400">Preco: R$ {Number(p.price).toFixed(2)}</div>
          </div>
        ))}
        {(!proposals || proposals.length === 0) && (
          <div className="text-sm text-zinc-300">Nenhuma proposta registrada.</div>
        )}
      </div>
    </div>
  );
}
