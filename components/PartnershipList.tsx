"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { CAMPAIGN_TYPE_LABEL } from "@/lib/domain/partnership";
import Link from "next/link";

type Partnership = {
  id: string;
  campaign_type?: string | null;
  status?: string | null;
  platform?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  geo_state?: string | null;
  geo_cities?: string[] | null;
  inquiry?: {
    id?: string | null;
    offer?: {
      title?: string | null;
      city?: string | null;
      state?: string | null;
    } | null;
  } | { id?: string | null; offer?: { title?: string | null; city?: string | null; state?: string | null } | null }[] | null;
};

const statusTabs = [
  { id: "draft", label: "Rascunho" },
  { id: "active", label: "Ativas" },
  { id: "delivered", label: "Entregues" },
  { id: "closed", label: "Finalizadas" },
];

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativa",
  delivered: "Entregue",
  closed: "Finalizada",
  cancelled: "Cancelada",
};

const statusVariant: Record<string, "status" | "success" | "danger" | "muted"> = {
  draft: "muted",
  active: "success",
  delivered: "status",
  closed: "muted",
  cancelled: "danger",
};

export default function PartnershipList({ partnerships }: { partnerships: Partnership[] }) {
  const [activeTab, setActiveTab] = useState("active");

  const filtered = useMemo(() => {
    return partnerships.filter((p) => {
      if (activeTab === "active") return p.status === "active";
      if (activeTab === "draft") return p.status === "draft";
      if (activeTab === "delivered") return p.status === "delivered";
      if (activeTab === "closed") return p.status === "closed";
      return true;
    });
  }, [activeTab, partnerships]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <Button
            key={tab.id}
            size="sm"
            variant={activeTab === tab.id ? "primary" : "secondary"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="text-xs text-zinc-400">
        Ativas = em andamento. Entregues = aguardando validacao. Finalizadas = concluidas.
      </div>

      <div className="grid gap-3">
        {filtered.map((p) => {
          const typeKey = (p.campaign_type ?? "SPONSORED_MENTION") as keyof typeof CAMPAIGN_TYPE_LABEL;
          const typeLabel = CAMPAIGN_TYPE_LABEL[typeKey] ?? "Parceria";
          const statusKey = p.status ?? "draft";
          const inquiry = Array.isArray(p.inquiry) ? p.inquiry[0] : p.inquiry;
          const offerTitle = inquiry?.offer?.title;
          const offerLocation = [inquiry?.offer?.city, inquiry?.offer?.state]
            .filter(Boolean)
            .join(" - ");
          const geoLocation = [p.geo_state, p.geo_cities?.join(", ")].filter(Boolean).join(" - ");
          const period = [p.start_date, p.end_date].filter(Boolean).join(" ate ");

          return (
            <Card key={p.id} interactive>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="platform">{typeLabel}</Badge>
                  <Badge variant={statusVariant[statusKey] || "status"}>
                    {statusLabel[statusKey] || "Status"}
                  </Badge>
                  {p.platform && <Badge variant="muted">{p.platform}</Badge>}
                </div>
                <Link href={`/partnerships/${p.id}`}>
                  <Button size="sm" variant="secondary">
                    Abrir
                  </Button>
                </Link>
              </div>

              <div className="mt-3 grid gap-1 text-sm text-zinc-300">
                {offerTitle && <div>Oferta vinculada: {offerTitle}</div>}
                {offerLocation && <div>Oferta: {offerLocation}</div>}
                {period && <div>Datas: {period}</div>}
                {geoLocation && <div>Local: {geoLocation}</div>}
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card>
            <div className="text-sm text-zinc-300">Nenhuma parceria neste filtro.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
