import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Separator from "@/components/ui/Separator";
import PartnershipEditor from "@/components/PartnershipEditor";
import PartnershipProofs from "@/components/PartnershipProofs";
import PartnershipStatusActions from "@/components/PartnershipStatusActions";
import { CAMPAIGN_TYPE_LABEL } from "@/lib/domain/partnership";
import Link from "next/link";

export default async function PartnershipDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { edit?: string };
}) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: partnership } = await supabase
    .from("campaigns")
    .select(
      "id,campaign_type,compensation_model,platform,fixed_fee,commission_rate,products,deliverables,content_rules,proof_required,start_date,end_date,geo_country,geo_state,geo_cities,status,inquiry_id,creator_id,brand_id,inquiry:offer_inquiries(id,offer:creator_offers(title))"
    )
    .eq("id", params.id)
    .single();

  if (!partnership) redirect("/dashboard");
  if (partnership.brand_id !== user.id && partnership.creator_id !== user.id) redirect("/dashboard");

  const typeKey = (partnership.campaign_type ?? "SPONSORED_MENTION") as keyof typeof CAMPAIGN_TYPE_LABEL;
  const typeLabel = CAMPAIGN_TYPE_LABEL[typeKey] ?? "Parceria";
  const statusLabel = String(partnership.status ?? "draft");
  const platformLabel = partnership.platform ?? "plataforma";
  const inquiry = Array.isArray(partnership.inquiry) ? partnership.inquiry[0] : partnership.inquiry;
  const offer = (inquiry && (Array.isArray(inquiry.offer) ? inquiry.offer[0] : inquiry.offer)) as
    | { title?: string | null }
    | null
    | undefined;
  const offerTitle = offer?.title ?? null;
  const deliverables = Array.isArray(partnership.deliverables) ? partnership.deliverables : [];
  const products = Array.isArray(partnership.products) ? partnership.products : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Parceria</h1>
            <p className="mt-1 text-sm text-slate-600">
              Esta parceria registra o combinado entre creator e patrocinador: entregaveis, remuneracao e comprovacao.
            </p>
          </div>
          <Link href="/dashboard">
            <Button size="sm" variant="secondary">
              Voltar ao painel
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="platform">{typeLabel}</Badge>
              <Badge variant="status">{statusLabel}</Badge>
              <Badge variant="muted">{platformLabel}</Badge>
            </div>

            {offerTitle && (
              <div className="mt-3 text-sm text-slate-600">Oferta vinculada: {offerTitle}</div>
            )}

            <Separator className="my-4" />

            <div className="grid gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Resumo do combinado</div>
                <div className="mt-2 text-sm text-slate-600">
                  {partnership.compensation_model === "COMMISSION" && (
                    <div>Comissao: {partnership.commission_rate ?? "-"}%</div>
                  )}
                  {partnership.compensation_model === "FIXED" && (
                    <div>Fee: {partnership.fixed_fee ? `R$ ${Number(partnership.fixed_fee).toFixed(2)}` : "-"}</div>
                  )}
                  {partnership.compensation_model === "HYBRID" && (
                    <div>
                      Fee: {partnership.fixed_fee ? `R$ ${Number(partnership.fixed_fee).toFixed(2)}` : "-"} + Comissao:{" "}
                      {partnership.commission_rate ?? "-"}%
                    </div>
                  )}
                </div>
              </div>

              {products.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-900">Produtos</div>
                  <ul className="mt-2 grid gap-1 text-sm text-slate-600">
                    {products.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="text-sm font-semibold text-slate-900">Entregaveis</div>
                <ul className="mt-2 grid gap-1 text-sm text-slate-600">
                  {deliverables.length > 0 ? (
                    deliverables.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>Sem entregaveis definidos.</li>
                  )}
                </ul>
              </div>

              <div className="grid gap-2 text-sm text-slate-600">
                {partnership.content_rules && (
                  <div>
                    <span className="text-slate-500">Regras:</span> {partnership.content_rules}
                  </div>
                )}
                {partnership.proof_required && (
                  <div>
                    <span className="text-slate-500">Comprovacao:</span> {partnership.proof_required}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            <Card>
              <div className="text-sm font-semibold text-slate-900">Linha do tempo</div>
              <div className="mt-2 text-xs text-slate-500">
                Enviado → Aceito → Ativo → Entregue → Finalizado
              </div>
              <div className="mt-4">
                <PartnershipStatusActions partnershipId={partnership.id} />
              </div>
            </Card>

            <Card>
              <div className="text-sm font-semibold text-slate-900">Provas</div>
              <div className="mt-3">
                <PartnershipProofs partnershipId={partnership.id} />
              </div>
            </Card>
          </div>
        </div>

        {searchParams.edit === "1" && (
          <div className="mt-6">
            <PartnershipEditor
              partnershipId={partnership.id}
              initial={{
                campaign_type: partnership.campaign_type ?? undefined,
                compensation_model: partnership.compensation_model ?? undefined,
                fixed_fee: partnership.fixed_fee ?? undefined,
                commission_rate: partnership.commission_rate ?? undefined,
                products: products,
                deliverables: deliverables,
                content_rules: partnership.content_rules ?? undefined,
                proof_required: partnership.proof_required ?? undefined,
                status: partnership.status ?? undefined,
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
