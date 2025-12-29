"use client";

import { useMemo, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import InquiryActions from "@/components/InquiryActions";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CampaignType, getDefaultCompensation } from "@/lib/domain/partnership";

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
  enableCreatePartnership?: boolean;
};

const tabs = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Aguardando" },
  { id: "accepted", label: "Aceitos" },
  { id: "rejected", label: "Rejeitados" },
];

export default function InquiryInbox({ inquiries, role, enableCreatePartnership }: Props) {
  const [activeTab, setActiveTab] = useState("all");
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

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
          const canCreatePartnership =
            enableCreatePartnership && role === "brand" && isAccepted && Boolean(inq.creator_id);

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
                <div className="flex flex-wrap gap-2">
                  {role === "creator" && <InquiryActions inquiryId={inq.id} />}
                  {canCreatePartnership && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        setCreateError(null);
                        setCreatingId(inq.id);
                        const { data: userData } = await supabase.auth.getUser();
                        const user = userData.user;
                        if (!user) {
                          setCreatingId(null);
                          setCreateError("Voce precisa estar logado.");
                          return;
                        }

                        const platform = inq.offer?.platform?.toLowerCase() ?? "tiktok";
                        const type: CampaignType =
                          platform === "tiktok" ? "TIKTOK_SHOP_AFFILIATE" : "SPONSORED_MENTION";

                        let deliverables: string[] = [];
                        if (inq.offer?.id) {
                          const { data: items } = await supabase
                            .from("offer_items")
                            .select("type,quantity,requirement")
                            .eq("offer_id", inq.offer.id);
                          deliverables =
                            items?.map((item) => {
                              const qty = item.quantity ? `${item.quantity}x ` : "";
                              const req = item.requirement ? ` - ${item.requirement}` : "";
                              return `${qty}${item.type ?? "entregavel"}${req}`;
                            }) ?? [];
                        }

                        const { data, error } = await supabase
                          .from("campaigns")
                          .insert({
                            brand_id: user.id,
                            creator_id: inq.creator_id,
                            inquiry_id: inq.id,
                            campaign_type: type,
                            compensation_model: getDefaultCompensation(type),
                            platform,
                            status: "draft",
                            deliverables: deliverables.length ? deliverables : null,
                          })
                          .select("id")
                          .single();

                        setCreatingId(null);

                        if (error || !data) {
                          setCreateError(error?.message ?? "Erro ao criar parceria.");
                          return;
                        }

                        router.push(`/partnerships/${data.id}?edit=1`);
                        router.refresh();
                      }}
                      disabled={creatingId === inq.id}
                    >
                      {creatingId === inq.id ? "Criando..." : "Criar parceria"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card>
            <div className="text-sm text-zinc-300">Nenhum pedido encontrado.</div>
          </Card>
        )}
        {createError && <div className="text-sm text-red-300">{createError}</div>}
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
