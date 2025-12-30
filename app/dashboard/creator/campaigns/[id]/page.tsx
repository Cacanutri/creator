import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import SendProposal from "@/components/SendProposal";
import RatingForm from "@/components/RatingForm";

export default async function CreatorCampaignDetail({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: campaign } = await supabase.from("campaigns").select("*").eq("id", params.id).single();

  if (!campaign) redirect("/dashboard/creator/campaigns");
  const isOwner = campaign.creator_id === user.id;
  if (!isOwner && campaign.status !== "open") redirect("/dashboard/creator/campaigns");

  const { data: deliverables } = await supabase
    .from("campaign_deliverables")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: true });

  const { data: myProposal } = await supabase
    .from("proposals")
    .select("id,status,price,message")
    .eq("campaign_id", campaign.id)
    .eq("creator_id", user.id)
    .maybeSingle();

  const { data: myRating } = await supabase
    .from("ratings")
    .select("id")
    .eq("campaign_id", campaign.id)
    .eq("from_user_id", user.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-xl font-semibold">{campaign.title}</h1>
      <p className="mt-1 text-sm text-zinc-300">
        Status: <span className="text-zinc-100">{String(campaign.status).toUpperCase()}</span>
      </p>
      {campaign.description && <p className="mt-2 text-sm text-zinc-300">{campaign.description}</p>}

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Entregaveis</h2>
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
      </div>

      {myProposal ? (
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/20 p-3">
          <div className="text-sm font-semibold">Sua proposta</div>
          <div className="mt-1 text-sm text-zinc-300">
            Status: <span className="text-zinc-100">{String(myProposal.status).toUpperCase()}</span>
          </div>
          <div className="mt-1 text-sm text-zinc-300">Preco: R$ {Number(myProposal.price).toFixed(2)}</div>
          {myProposal.message && <div className="mt-2 text-sm text-zinc-300">{myProposal.message}</div>}
        </div>
      ) : campaign.status === "open" ? (
        <SendProposal campaignId={campaign.id} />
      ) : (
        <div className="mt-5 text-sm text-zinc-300">Aguardando atualizacoes da campanha.</div>
      )}

      {campaign.status === "closed" && campaign.brand_id && (
        <div className="mt-8">
          {myRating ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 text-sm text-zinc-300">
              Avaliacao enviada.
            </div>
          ) : (
            <RatingForm campaignId={campaign.id} toUserId={campaign.brand_id} title="Avaliar marca" />
          )}
        </div>
      )}
    </div>
  );
}
