import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function BrandCampaigns() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,title,status,budget,created_at")
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Campanhas</h1>
        <Link
          href="/dashboard/brand/campaigns/new"
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          Nova campanha
        </Link>
      </div>

      <div className="mt-4 grid gap-2">
        {(campaigns ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/brand/campaigns/${c.id}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 hover:bg-zinc-900/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-zinc-400">
                  Budget: {c.budget ? `R$ ${Number(c.budget).toFixed(2)}` : "—"}
                </div>
              </div>
              <div className="text-xs text-zinc-300">{String(c.status).toUpperCase()}</div>
            </div>
          </Link>
        ))}

        {(!campaigns || campaigns.length === 0) && (
          <div className="text-sm text-zinc-300">Crie sua primeira campanha.</div>
        )}
      </div>
    </div>
  );
}
