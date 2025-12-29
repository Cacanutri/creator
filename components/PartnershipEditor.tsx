"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Toast from "@/components/ui/Toast";
import {
  CAMPAIGN_TYPE_DESC,
  CAMPAIGN_TYPE_LABEL,
  CampaignType,
  CompensationModel,
  getDefaultCompensation,
  validatePartnership,
} from "@/lib/domain/partnership";

type Props = {
  partnershipId: string;
  initial: {
    campaign_type?: CampaignType | null;
    compensation_model?: CompensationModel | null;
    fixed_fee?: number | null;
    commission_rate?: number | null;
    products?: string[] | null;
    deliverables?: string[] | null;
    content_rules?: string | null;
    proof_required?: string | null;
    status?: string | null;
  };
};

const proofDefaults: Record<CampaignType, string> = {
  TIKTOK_SHOP_AFFILIATE: "Link do video + print do painel do TikTok Shop",
  UGC_FOR_ADS: "Links dos arquivos finais",
  SPONSORED_MENTION: "Link do post/video",
};

export default function PartnershipEditor({ partnershipId, initial }: Props) {
  const supabase = supabaseBrowser();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<CampaignType>(initial.campaign_type ?? "SPONSORED_MENTION");
  const [compModel, setCompModel] = useState<CompensationModel>(
    initial.compensation_model ?? getDefaultCompensation(initial.campaign_type ?? "SPONSORED_MENTION")
  );
  const [fixedFee, setFixedFee] = useState<string>(
    initial.fixed_fee !== null && initial.fixed_fee !== undefined ? String(initial.fixed_fee) : ""
  );
  const [commissionRate, setCommissionRate] = useState<string>(
    initial.commission_rate !== null && initial.commission_rate !== undefined
      ? String(initial.commission_rate)
      : ""
  );
  const [products, setProducts] = useState<string>(
    (initial.products ?? []).join("\n")
  );
  const [deliverables, setDeliverables] = useState<string>(
    (initial.deliverables ?? []).join("\n")
  );
  const [contentRules, setContentRules] = useState<string>(initial.content_rules ?? "");
  const [proofRequired, setProofRequired] = useState<string>(
    initial.proof_required ?? proofDefaults[type]
  );
  const [status, setStatus] = useState<string>(initial.status ?? "draft");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    setCompModel(getDefaultCompensation(type));
    setProofRequired((prev) => (prev ? prev : proofDefaults[type]));
  }, [type]);

  const payload = useMemo(() => {
    const fixed = fixedFee.trim() ? Number(fixedFee.replace(",", ".")) : null;
    const commission = commissionRate.trim() ? Number(commissionRate.replace(",", ".")) : null;
    const productsArray = products
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const deliverablesArray = deliverables
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    return {
      campaign_type: type,
      compensation_model: compModel,
      fixed_fee: Number.isNaN(fixed) ? null : fixed,
      commission_rate: Number.isNaN(commission) ? null : commission,
      products: productsArray,
      deliverables: deliverablesArray,
      content_rules: contentRules || null,
      proof_required: proofRequired || null,
      status,
    };
  }, [type, compModel, fixedFee, commissionRate, products, deliverables, contentRules, proofRequired, status]);

  async function save(nextStatus?: string) {
    setErrors([]);
    setOk(null);

    const validation = validatePartnership(payload);
    if (validation.length) {
      setErrors(validation);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("campaigns")
      .update({
        campaign_type: payload.campaign_type,
        compensation_model: payload.compensation_model,
        fixed_fee: payload.fixed_fee,
        commission_rate: payload.commission_rate,
        products: payload.products,
        deliverables: payload.deliverables,
        content_rules: payload.content_rules,
        proof_required: payload.proof_required,
        status: nextStatus ?? payload.status ?? "draft",
      })
      .eq("id", partnershipId);
    setSaving(false);

    if (error) {
      setErrors([error.message]);
      return;
    }

    setStatus(nextStatus ?? payload.status ?? "draft");
    setOk("Parceria atualizada.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar parceria</CardTitle>
        <CardDescription>Defina tipo, detalhes e ative quando estiver pronto.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={step === 1 ? "primary" : "secondary"} onClick={() => setStep(1)}>
            Tipo
          </Button>
          <Button size="sm" variant={step === 2 ? "primary" : "secondary"} onClick={() => setStep(2)}>
            Detalhes
          </Button>
          <Button size="sm" variant={step === 3 ? "primary" : "secondary"} onClick={() => setStep(3)}>
            Publicar
          </Button>
        </div>

        {errors.length > 0 && (
          <Toast variant="danger">
            <div className="grid gap-1">
              {errors.map((err) => (
                <div key={err}>{err}</div>
              ))}
            </div>
          </Toast>
        )}

        {step === 1 && (
          <div className="grid gap-3 md:grid-cols-3">
            {Object.keys(CAMPAIGN_TYPE_LABEL).map((key) => {
              const typeKey = key as CampaignType;
              const selected = type === typeKey;
              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => setType(typeKey)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected ? "border-blue-500/60 bg-blue-500/10" : "border-zinc-800/70 bg-zinc-900/30"
                  }`}
                >
                  <div className="text-sm font-semibold text-zinc-100">{CAMPAIGN_TYPE_LABEL[typeKey]}</div>
                  <div className="mt-2 text-xs text-zinc-300">{CAMPAIGN_TYPE_DESC[typeKey]}</div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            {type === "TIKTOK_SHOP_AFFILIATE" && (
              <>
                <div className="text-xs text-zinc-400">
                  A comissao por venda e processada pelo TikTok Shop. Aqui voce registra entregas e links do conteudo.
                </div>
                <label className="grid gap-1 text-xs text-zinc-400">
                  Comissao (%)
                  <Input value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} />
                </label>
                <label className="grid gap-1 text-xs text-zinc-400">
                  Produtos (um link por linha)
                  <Textarea rows={4} value={products} onChange={(e) => setProducts(e.target.value)} />
                </label>
              </>
            )}

            {type !== "TIKTOK_SHOP_AFFILIATE" && (
              <label className="grid gap-1 text-xs text-zinc-400">
                Fee fixo
                <Input value={fixedFee} onChange={(e) => setFixedFee(e.target.value)} />
              </label>
            )}

            {type === "UGC_FOR_ADS" && (
              <label className="grid gap-1 text-xs text-zinc-400">
                Regras do conteudo
                <Textarea rows={4} value={contentRules} onChange={(e) => setContentRules(e.target.value)} />
              </label>
            )}

            <label className="grid gap-1 text-xs text-zinc-400">
              Entregaveis (um por linha)
              <Textarea rows={4} value={deliverables} onChange={(e) => setDeliverables(e.target.value)} />
            </label>

            <label className="grid gap-1 text-xs text-zinc-400">
              Comprovacao
              <Input value={proofRequired} onChange={(e) => setProofRequired(e.target.value)} />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3">
            <div className="text-sm text-zinc-300">
              Status atual: <span className="font-semibold text-zinc-100">{status}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => save("draft")} disabled={saving}>
                {saving ? "Salvando..." : "Salvar rascunho"}
              </Button>
              <Button size="sm" onClick={() => save("active")} disabled={saving}>
                {saving ? "Ativando..." : "Ativar parceria"}
              </Button>
            </div>
          </div>
        )}

        {ok && <Toast variant="success">{ok}</Toast>}
      </CardContent>
    </Card>
  );
}
