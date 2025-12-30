import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import SendProposal from "@/components/SendProposal";

export default async function CampaignDetail({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = profile?.role ?? null;
  }

  const { data: campaign } = await supabase.from("campaigns").select("*").eq("id", params.id).single();
  if (!campaign) redirect("/vitrine/campaigns");
  if (campaign.status !== "open" && role !== "admin") redirect("/vitrine/campaigns");

  const { data: deliverables } = await supabase
    .from("campaign_deliverables")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: true });

  const canPropose = role === "creator";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/vitrine/campaigns" className="text-sm text-slate-600 hover:text-slate-900">
          {"<-"} Voltar para vitrine
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{campaign.title}</h1>
              <p className="mt-1 text-xs text-slate-500">
                {campaign.platform?.toUpperCase() || "PLATAFORMA"} - {campaign.campaign_type || "Campanha"}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Aberta</span>
          </div>

          {campaign.description && <p className="mt-4 text-sm text-slate-700">{campaign.description}</p>}

          <div className="mt-6">
            <div className="text-sm font-semibold text-slate-900">Entregaveis</div>
            <div className="mt-3 grid gap-2">
              {(deliverables ?? []).map((d) => (
                <div key={d.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{d.type}</div>
                    <div className="text-xs text-slate-500">Qtd: {d.quantity}</div>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{d.requirement}</div>
                </div>
              ))}
              {(!deliverables || deliverables.length === 0) && (
                <div className="text-sm text-slate-600">Sem entregaveis cadastrados.</div>
              )}
            </div>
          </div>

          <div className="mt-6">
            {user && canPropose && <SendProposal campaignId={campaign.id} />}
            {user && !canPropose && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                Apenas creators podem concorrer.
              </div>
            )}
            {!user && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <Link href="/login" className="font-medium text-slate-900">
                  Entrar
                </Link>{" "}
                para concorrer.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
