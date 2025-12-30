import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { CREATOR_TAB_MAP, getCreatorTab } from "@/lib/domain/campaignStatus";

type Props = {
  searchParams?: { tab?: string };
};

export default async function CreatorCampaigns({ searchParams }: Props) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const tabKey = getCreatorTab(searchParams?.tab);
  const tab = CREATOR_TAB_MAP[tabKey];

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,title,status,objective,budget,created_at")
    .eq("creator_id", user.id)
    .in("status", tab.statuses)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Campanhas</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Aqui aparecem campanhas que voce ganhou, em andamento e finalizadas.
          </p>
        </div>
        <Link
          href="/vitrine/campaigns"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800/60"
        >
          Ver campanhas abertas
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/vitrine/campaigns"
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800/60"
        >
          Abertas (vitrine)
        </Link>
        {Object.entries(CREATOR_TAB_MAP).map(([key, item]) => (
          <Link
            key={key}
            href={`/dashboard/creator/campaigns?tab=${key}`}
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
            href={`/dashboard/creator/campaigns/${c.id}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 hover:bg-zinc-900/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-zinc-400">
                  Obj: {c.objective || "-"} - Budget: {c.budget ? `R$ ${Number(c.budget).toFixed(2)}` : "-"}
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
