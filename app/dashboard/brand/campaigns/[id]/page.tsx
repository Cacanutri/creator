import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProposalActions from "@/components/ProposalActions";

export default async function BrandCampaignDetail({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!campaign) redirect("/dashboard/brand/campaigns");
  if (campaign.brand_id !== user.id) redirect("/dashboard/brand/campaigns");

  const { data: deliverables } = await supabase
    .from("campaign_deliverables")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: true });

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, creator_id, message, price, status, created_at")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  const { data: agreement } = await supabase
    .from("agreements")
    .select("id, status, total_value, creator_id")
    .eq("campaign_id", campaign.id)
    .maybeSingle();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{campaign.title}</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Status: <span className="text-zinc-100">{String(campaign.status).toUpperCase()}</span>
          </p>
          {campaign.description && <p className="mt-3 text-sm text-zinc-300">{campaign.description}</p>}
        </div>

        {agreement?.id && (
          <a
            href={`/dashboard/brand/agreements/${agreement.id}`}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800/60"
          >
            Ver acordo
          </a>
        )}
      </div>

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Entregáveis</h2>
      <div className="mt-3 grid gap-2">
        {(deliverables ?? []).map((d) => (
          <div key={d.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{d.type}</div>
              <div className="text-xs text-zinc-400">Qtd: {d.quantity}</div>
            </div>
            <div className="mt-1 text-sm text-zinc-300">{d.requirement}</div>
          </div>
        ))}
        {(!deliverables || deliverables.length === 0) && (
          <div className="text-sm text-zinc-300">Sem entregáveis cadastrados.</div>
        )}
      </div>

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Propostas</h2>
      <div className="mt-3 grid gap-3">
        {(proposals ?? []).map((p) => (
          <div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-zinc-200">
                <span className="text-zinc-400">Creator:</span> {p.creator_id}
              </div>
              <div className="text-xs text-zinc-300">{String(p.status).toUpperCase()}</div>
            </div>

            <div className="mt-2 text-sm">
              <span className="text-zinc-400">Preço:</span>{" "}
              <span className="font-medium text-zinc-50">R$ {Number(p.price).toFixed(2)}</span>
            </div>

            {p.message && <div className="mt-2 text-sm text-zinc-300">{p.message}</div>}

            <div className="mt-3">
              {p.status === "sent" && !agreement?.id ? (
                <ProposalActions
                  campaignId={campaign.id}
                  brandId={campaign.brand_id}
                  creatorId={p.creator_id}
                  proposalId={p.id}
                  price={Number(p.price)}
                />
              ) : (
                <div className="text-xs text-zinc-400">Ação indisponível.</div>
              )}
            </div>
          </div>
        ))}

        {(!proposals || proposals.length === 0) && (
          <div className="text-sm text-zinc-300">Nenhuma proposta ainda.</div>
        )}
      </div>
    </div>
  );
}