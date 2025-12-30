import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminModeration() {
  const supabase = supabaseServer();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,title,status,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-semibold">Moderacao</h1>
      <p className="mt-1 text-sm text-zinc-300">Revise campanhas e aplique ajustes quando necessario.</p>

      <div className="mt-4 grid gap-2">
        {(campaigns ?? []).map((c) => (
          <div key={c.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">{c.title}</div>
              <div className="text-xs text-zinc-300">{String(c.status).toUpperCase()}</div>
            </div>
            <div className="mt-1 text-xs text-zinc-400">ID: {c.id}</div>
          </div>
        ))}
        {(!campaigns || campaigns.length === 0) && (
          <div className="text-sm text-zinc-300">Nenhuma campanha para moderar.</div>
        )}
      </div>
    </div>
  );
}
