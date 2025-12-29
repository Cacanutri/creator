import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function BrandHome() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,title,status,created_at")
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Painel da Marca</h1>
          <p className="mt-1 text-sm text-zinc-300">Crie campanhas e feche acordos com creators.</p>
        </div>

        <Link
          href="/dashboard/brand/campaigns/new"
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          Nova campanha
        </Link>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Últimas campanhas</h2>

      <div className="mt-3 grid gap-2">
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
          </Link>
        ))}
        {(!campaigns || campaigns.length === 0) && (
          <div className="text-sm text-zinc-300">Nenhuma campanha ainda.</div>
        )}
      </div>
    </div>
  );
}
