export type CampaignType =
  | "TIKTOK_SHOP_AFFILIATE"
  | "UGC_FOR_ADS"
  | "SPONSORED_MENTION";

export type CompensationModel = "FIXED" | "COMMISSION" | "HYBRID";

export const CAMPAIGN_TYPE_LABEL: Record<CampaignType, string> = {
  TIKTOK_SHOP_AFFILIATE: "TikTok Shop Affiliate",
  UGC_FOR_ADS: "UGC para Ads",
  SPONSORED_MENTION: "Mencao patrocinada",
};

export const CAMPAIGN_TYPE_DESC: Record<CampaignType, string> = {
  TIKTOK_SHOP_AFFILIATE:
    "Creator divulga produto do TikTok Shop e recebe comissao por venda atribuida.",
  UGC_FOR_ADS:
    "Creator produz conteudo (UGC) para a marca usar em anuncios. Pagamento fixo por entrega.",
  SPONSORED_MENTION: "Mencao/publipost em video/live/post. Pagamento fixo.",
};

export function getDefaultCompensation(type: CampaignType): CompensationModel {
  if (type === "TIKTOK_SHOP_AFFILIATE") return "COMMISSION";
  if (type === "UGC_FOR_ADS") return "FIXED";
  return "FIXED";
}

type PartnershipPayload = {
  campaign_type?: CampaignType | null;
  compensation_model?: CompensationModel | null;
  fixed_fee?: number | null;
  commission_rate?: number | null;
  products?: string[] | null;
  deliverables?: string[] | null;
};

export function validatePartnership(payload: PartnershipPayload) {
  const errors: string[] = [];
  const type = payload.campaign_type;

  if (!type) {
    errors.push("Selecione o tipo de parceria.");
    return errors;
  }

  if (type === "TIKTOK_SHOP_AFFILIATE") {
    if (!payload.commission_rate || payload.commission_rate <= 0) {
      errors.push("Informe a taxa de comissao.");
    }
    if (!payload.products || payload.products.length === 0) {
      errors.push("Informe ao menos um produto do TikTok Shop.");
    }
  }

  if (payload.compensation_model === "FIXED" || payload.compensation_model === "HYBRID") {
    if (!payload.fixed_fee || payload.fixed_fee <= 0) {
      errors.push("Informe o fee fixo.");
    }
  }

  if (!payload.deliverables || payload.deliverables.length === 0) {
    errors.push("Informe ao menos um entregavel.");
  }

  return errors;
}
