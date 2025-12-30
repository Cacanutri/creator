import { supabaseServer } from "@/lib/supabase/server";

export default async function CreatorRatings() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: ratings } = await supabase
    .from("ratings")
    .select("id,campaign_id,from_user_id,stars,comment,created_at")
    .eq("to_user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Avaliacoes</h1>
      <p className="mt-1 text-sm text-zinc-300">Avaliacoes recebidas das marcas.</p>

      <div className="mt-4 grid gap-2">
        {(ratings ?? []).map((r) => (
          <div key={r.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">Campanha: {r.campaign_id}</div>
              <div className="text-xs text-zinc-300">{r.stars} estrelas</div>
            </div>
            <div className="mt-1 text-xs text-zinc-400">Marca: {r.from_user_id}</div>
            {r.comment && <div className="mt-1 text-xs text-zinc-300">{r.comment}</div>}
          </div>
        ))}
        {(!ratings || ratings.length === 0) && (
          <div className="text-sm text-zinc-300">Sem avaliacoes ainda.</div>
        )}
      </div>
    </div>
  );
}
