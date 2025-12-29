"use client";

import { useMemo, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import InquiryActions from "@/components/InquiryActions";

type Inquiry = {
  id: string;
  status?: string | null;
  budget?: number | null;
  message?: string | null;
  created_at?: string | null;
  creator_id?: string | null;
  brand_id?: string | null;
  offer?: {
    id?: string;
    title?: string | null;
    platform?: string | null;
    niche?: string | null;
    price_from?: number | null;
    city?: string | null;
    state?: string | null;
  } | null;
};

type Props = {
  inquiries: Inquiry[];
  role: "creator" | "brand";
};

const tabs = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Aguardando" },
  { id: "accepted", label: "Aceitos" },
  { id: "rejected", label: "Rejeitados" },
];

export default function InquiryInbox({ inquiries, role }: Props) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      const normalized = String(inq.status ?? "sent").toLowerCase();
      const isAccepted = normalized === "accepted";
      const isRejected = normalized === "rejected";
      const isClosed = normalized === "closed";
      const isPending = !isAccepted && !isRejected && !isClosed;

      if (activeTab === "accepted") return isAccepted;
      if (activeTab === "rejected") return isRejected;
      if (activeTab === "pending") return isPending;
      return true;
    });
  }, [activeTab, inquiries]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
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

      <div className="grid gap-3">
        {filtered.map((inq) => {
          const normalized = String(inq.status ?? "sent").toLowerCase();
          const isAccepted = normalized === "accepted";
          const isRejected = normalized === "rejected";
          const isClosed = normalized === "closed";
          const statusLabel = isAccepted
            ? "Aceito"
            : isRejected
            ? "Recusado"
            : isClosed
            ? "Finalizado"
            : "Enviado";
          const badgeVariant = isAccepted
            ? "success"
            : isRejected
            ? "danger"
            : isClosed
            ? "muted"
            : "status";
          const location = [inq.offer?.city, inq.offer?.state].filter(Boolean).join(" - ");

          return (
            <Card key={inq.id} interactive>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar name={inq.offer?.title ?? "Oferta"} />
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">
                      {inq.offer?.title || "Oferta"}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {role === "creator" ? `Marca: ${inq.brand_id}` : `Creator: ${inq.creator_id}`}
                    </div>
                    {location && <div className="text-xs text-zinc-400">{location}</div>}
                  </div>
                </div>
                <Badge variant={badgeVariant}>{statusLabel}</Badge>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-zinc-300">
                <div>
                  Orcamento: {inq.budget ? `R$ ${Number(inq.budget).toFixed(2)}` : "-"}
                </div>
                {inq.message && <div className="text-sm text-zinc-300">{inq.message}</div>}
                {inq.created_at && (
                  <div className="text-xs text-zinc-400">
                    {new Date(inq.created_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <StatusTimeline status={normalized} />
                {role === "creator" && <InquiryActions inquiryId={inq.id} />}
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card>
            <div className="text-sm text-zinc-300">Nenhum pedido encontrado.</div>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatusTimeline({ status }: { status: string }) {
  const isAccepted = status === "accepted";
  const isRejected = status === "rejected";
  const isClosed = status === "closed";
  const isPending = !isAccepted && !isRejected && !isClosed;

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      <Step active label="Enviado" />
      <span className="h-px w-6 bg-zinc-700/70" />
      <Step active={isAccepted || isRejected || isClosed} label={isRejected ? "Recusado" : "Aceito"} />
      <span className="h-px w-6 bg-zinc-700/70" />
      <Step active={isClosed} label="Finalizado" />
      {isPending && <span className="text-xs text-zinc-500">Aguardando resposta</span>}
    </div>
  );
}

function Step({ active, label }: { active?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-400" : "bg-zinc-600"}`} />
      <span>{label}</span>
    </div>
  );
}
