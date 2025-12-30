export type CampaignStatus =
  | "draft"
  | "open"
  | "awarded"
  | "active"
  | "delivered"
  | "closed"
  | "cancelled";

export const CREATOR_TAB_MAP = {
  won: {
    label: "Vencidas",
    statuses: ["awarded"] as CampaignStatus[],
  },
  active: {
    label: "Em andamento",
    statuses: ["active", "delivered"] as CampaignStatus[],
  },
  closed: {
    label: "Finalizadas",
    statuses: ["closed"] as CampaignStatus[],
  },
};

export const BRAND_TAB_MAP = {
  draft: {
    label: "Rascunhos",
    statuses: ["draft"] as CampaignStatus[],
  },
  open: {
    label: "Abertas",
    statuses: ["open"] as CampaignStatus[],
  },
  active: {
    label: "Em andamento",
    statuses: ["awarded", "active", "delivered"] as CampaignStatus[],
  },
  closed: {
    label: "Finalizadas",
    statuses: ["closed"] as CampaignStatus[],
  },
};

export function isCreatorWon(status?: string | null) {
  return status === "awarded" || status === "active" || status === "delivered" || status === "closed";
}

export function getCreatorTab(key?: string | null) {
  if (key && key in CREATOR_TAB_MAP) return key as keyof typeof CREATOR_TAB_MAP;
  return "won";
}

export function getBrandTab(key?: string | null) {
  if (key && key in BRAND_TAB_MAP) return key as keyof typeof BRAND_TAB_MAP;
  return "open";
}
