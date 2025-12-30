import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminCampaigns() {
  const supabase = supabaseServer();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,title,status,brand_id,creator_id,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-xl font-semibold">Campanhas</h1>
      <p className="mt-1 text-sm text-zinc-300">Todas as campanhas da plataforma.</p>

      <div className="mt-4 grid gap-2">
        {(campaigns ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/brand/campaigns/${c.id}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 hover:bg-zinc-900/50"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-zinc-300">{String(c.status).toUpperCase()}</div>
            </div>
            <div className="mt-1 text-xs text-zinc-400">Brand: {c.brand_id}</div>
            {c.creator_id && <div className="text-xs text-zinc-400">Creator: {c.creator_id}</div>}
          </Link>
        ))}
        {(!campaigns || campaigns.length === 0) && (
          <div className="text-sm text-zinc-300">Nenhuma campanha cadastrada.</div>
        )}
      </div>
    </div>
  );
}
