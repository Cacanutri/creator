import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminRatings() {
  const supabase = supabaseServer();
  const { data: ratings } = await supabase
    .from("ratings")
    .select("id,campaign_id,from_user_id,to_user_id,stars,comment,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-xl font-semibold">Avaliacoes</h1>
      <p className="mt-1 text-sm text-zinc-300">Avaliacoes trocadas entre creators e marcas.</p>

      <div className="mt-4 grid gap-2">
        {(ratings ?? []).map((r) => (
          <div key={r.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">Campanha: {r.campaign_id}</div>
              <div className="text-xs text-zinc-300">{r.stars} estrelas</div>
            </div>
            <div className="mt-1 text-xs text-zinc-400">De: {r.from_user_id}</div>
            <div className="text-xs text-zinc-400">Para: {r.to_user_id}</div>
            {r.comment && <div className="mt-1 text-xs text-zinc-300">{r.comment}</div>}
          </div>
        ))}
        {(!ratings || ratings.length === 0) && (
          <div className="text-sm text-zinc-300">Nenhuma avaliacao registrada.</div>
        )}
      </div>
    </div>
  );
}
