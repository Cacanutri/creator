"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const STATUS_OPTIONS = [
  { value: "draft", label: "Rascunho" },
  { value: "open", label: "Aberta" },
  { value: "awarded", label: "Selecionada" },
  { value: "active", label: "Em andamento" },
  { value: "delivered", label: "Entregue" },
  { value: "closed", label: "Finalizada" },
  { value: "cancelled", label: "Cancelada" },
];

export default function CampaignStatusActions({
  campaignId,
  currentStatus,
}: {
  campaignId: string;
  currentStatus: string;
}) {
  const supabase = supabaseBrowser();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function updateStatus() {
    setErr(null);
    setOk(null);
    setSaving(true);
    const { error } = await supabase.from("campaigns").update({ status }).eq("id", campaignId);
    setSaving(false);
    if (error) return setErr(error.message);
    setOk("Status atualizado.");
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
      <div className="text-sm font-semibold text-zinc-200">Status da campanha</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={updateStatus}
          disabled={saving}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Atualizar"}
        </button>
      </div>
      {err && <div className="mt-2 text-xs text-red-400">{err}</div>}
      {ok && <div className="mt-2 text-xs text-emerald-300">{ok}</div>}
    </div>
  );
}
