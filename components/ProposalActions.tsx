"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProposalActions(props: {
  campaignId: string;
  brandId: string;
  creatorId: string;
  proposalId: string;
  price: number;
}) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function accept() {
    setErr(null);
    setLoading(true);

    const { data: existing } = await supabase
      .from("agreements")
      .select("id")
      .eq("campaign_id", props.campaignId)
      .maybeSingle();

    if (existing?.id) {
      setLoading(false);
      return setErr("Esta campanha já possui um acordo.");
    }

    const { error: e1 } = await supabase
      .from("proposals")
      .update({ status: "accepted" })
      .eq("id", props.proposalId);

    if (e1) {
      setLoading(false);
      return setErr(e1.message);
    }

    await supabase
      .from("proposals")
      .update({ status: "rejected" })
      .eq("campaign_id", props.campaignId)
      .neq("id", props.proposalId)
      .eq("status", "sent");

    const { error: e2 } = await supabase.from("agreements").insert({
      campaign_id: props.campaignId,
      brand_id: props.brandId,
      creator_id: props.creatorId,
      proposal_id: props.proposalId,
      total_value: props.price,
      terms: "MVP: termos padrão. Ajuste aqui depois.",
      status: "active",
    });

    if (e2) {
      setLoading(false);
      return setErr(e2.message);
    }

    await supabase.from("campaigns").update({ status: "closed" }).eq("id", props.campaignId);

    setLoading(false);
    router.refresh();
  }

  async function reject() {
    setErr(null);
    setLoading(true);
    const { error } = await supabase.from("proposals").update({ status: "rejected" }).eq("id", props.proposalId);
    setLoading(false);
    if (error) return setErr(error.message);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={accept}
          disabled={loading}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
        >
          {loading ? "..." : "Aceitar"}
        </button>
        <button
          onClick={reject}
          disabled={loading}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800/60 disabled:opacity-60"
        >
          Rejeitar
        </button>
      </div>
      {err && <div className="text-xs text-red-400">{err}</div>}
    </div>
  );
}
