import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function CreatorCampaigns() {
  const supabase = supabaseServer();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,title,objective,budget,created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Campanhas abertas</h1>
      <p className="mt-1 text-sm text-zinc-300">Entre, veja entregáveis e envie sua proposta.</p>

      <div className="mt-4 grid gap-2">
        {(campaigns ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/creator/campaigns/${c.id}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 hover:bg-zinc-900/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-zinc-400">
                  Obj: {c.objective || "—"} • Budget: {c.budget ? `R$ ${Number(c.budget).toFixed(2)}` : "—"}
                </div>
              </div>
              <div className="text-xs text-zinc-300">ABERTA</div>
            </div>
          </Link>
        ))}
      </div>

      {(!campaigns || campaigns.length === 0) && (
        <div className="mt-4 text-sm text-zinc-300">Sem campanhas abertas.</div>
      )}
    </div>
  );
}