import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function CampaignVitrine() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = profile?.role ?? null;
  }

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id,title,platform,campaign_type,compensation_model,fixed_fee,commission_rate,geo_country,geo_state,geo_cities,status,created_at"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Campanhas abertas</h1>
            <p className="mt-1 text-sm text-slate-600">Campanhas abertas para creators concorrerem.</p>
          </div>
          <div className="text-sm text-slate-500">
            {role === "creator" ? "Voce pode concorrer." : "Apenas creators podem concorrer."}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(campaigns ?? []).map((c) => {
            const location = [c.geo_state, c.geo_country].filter(Boolean).join(" - ");
            const compensation =
              c.compensation_model === "COMMISSION"
                ? `Comissao: ${c.commission_rate ?? "-"}%`
                : c.fixed_fee
                ? `Fee: R$ ${Number(c.fixed_fee).toFixed(2)}`
                : "Remuneracao a definir";
            const cta =
              role === "creator" ? "Concorrer" : role === "brand" ? "Ver detalhes" : "Entrar para concorrer";
            return (
              <Link
                key={c.id}
                href={`/vitrine/campaigns/${c.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Aberta</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {c.platform?.toUpperCase() || "PLATAFORMA"} - {c.campaign_type || "Campanha"}
                </div>
                <div className="mt-2 text-sm text-slate-700">{compensation}</div>
                {location && <div className="mt-1 text-xs text-slate-500">Local: {location}</div>}
                <div className="mt-4 inline-flex rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                  {cta}
                </div>
              </Link>
            );
          })}
          {(!campaigns || campaigns.length === 0) && (
            <div className="text-sm text-slate-600">Sem campanhas abertas no momento.</div>
          )}
        </div>
      </div>
    </main>
  );
}
