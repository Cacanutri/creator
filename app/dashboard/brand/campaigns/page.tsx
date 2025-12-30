import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { BRAND_TAB_MAP, getBrandTab } from "@/lib/domain/campaignStatus";

type Props = {
  searchParams?: { tab?: string };
};

export default async function BrandCampaigns({ searchParams }: Props) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const tabKey = getBrandTab(searchParams?.tab);
  const tab = BRAND_TAB_MAP[tabKey];

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,title,status,budget,created_at")
    .eq("brand_id", user.id)
    .in("status", tab.statuses)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Campanhas</h1>
          <p className="mt-1 text-sm text-zinc-300">Crie campanhas, receba propostas e selecione creators.</p>
        </div>
        <Link
          href="/dashboard/brand/campaigns/new"
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          Nova campanha
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {Object.entries(BRAND_TAB_MAP).map(([key, item]) => (
          <Link
            key={key}
            href={`/dashboard/brand/campaigns?tab=${key}`}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              tabKey === key ? "border-zinc-100 bg-zinc-100 text-zinc-900" : "border-zinc-700 text-zinc-200"
            }`}
          >
            {item.label}
          </Link>
        ))}
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
                  Budget: {c.budget ? `R$ ${Number(c.budget).toFixed(2)}` : "-"}
                </div>
              </div>
              <div className="text-xs text-zinc-300">{String(c.status).toUpperCase()}</div>
            </div>
          </Link>
        ))}

        {(!campaigns || campaigns.length === 0) && (
          <div className="text-sm text-zinc-300">Nenhuma campanha neste status.</div>
        )}
      </div>
    </div>
  );
}
