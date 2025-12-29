"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type DeliverableDraft = {
  type: string;
  quantity: number;
  requirement: string;
  due_date?: string;
};

export default function NewCampaign() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState<string>("");

  const [status, setStatus] = useState<"draft" | "open">("open");

  const [deliverables, setDeliverables] = useState<DeliverableDraft[]>([
    { type: "youtube_views", quantity: 1, requirement: "10.000 views em 14 dias" },
  ]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function addDeliverable() {
    setDeliverables((d) => [...d, { type: "live_mentions", quantity: 4, requirement: "4 menções durante a live" }]);
  }

  function updateDel(i: number, patch: Partial<DeliverableDraft>) {
    setDeliverables((d) => d.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  function removeDel(i: number) {
    setDeliverables((d) => d.filter((_, idx) => idx !== i));
  }

  async function create() {
    setErr(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setLoading(false);
      return router.push("/login");
    }

    const budgetNumber = budget.trim() ? Number(budget.replace(",", ".")) : null;

    const { data: campaign, error: e1 } = await supabase
      .from("campaigns")
      .insert({
        brand_id: user.id,
        title,
        objective: objective || null,
        description: description || null,
        budget: budgetNumber,
        status,
      })
      .select("id")
      .single();

    if (e1 || !campaign) {
      setLoading(false);
      return setErr(e1?.message ?? "Erro ao criar campanha");
    }

    const rows = deliverables
      .filter((d) => d.type && d.requirement)
      .map((d) => ({
        campaign_id: campaign.id,
        type: d.type,
        quantity: d.quantity || 1,
        requirement: d.requirement,
        due_date: d.due_date || null,
      }));

    if (rows.length) {
      const { error: e2 } = await supabase.from("campaign_deliverables").insert(rows);
      if (e2) {
        setLoading(false);
        return setErr(e2.message);
      }
    }

    setLoading(false);
    router.push(`/dashboard/brand/campaigns/${campaign.id}`);
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Nova campanha</h1>
      <p className="mt-1 text-sm text-zinc-300">Defina o que você quer receber e deixe creators enviarem propostas.</p>

      <div className="mt-6 grid gap-3">
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
          placeholder="Título (ex.: Publi canal de futebol)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
          placeholder="Objetivo (ex.: vendas, tráfego, leads)"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
        />

        <textarea
          className="min-h-24 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
          placeholder="Descrição / briefing"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
            placeholder="Budget (ex.: 1500)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          <select
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="open">Aberta</option>
            <option value="draft">Rascunho</option>
          </select>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Entregáveis</h2>

      <div className="mt-3 grid gap-3">
        {deliverables.map((d, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
                placeholder="type (ex.: youtube_views)"
                value={d.type}
                onChange={(e) => updateDel(i, { type: e.target.value })}
              />
              <input
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
                placeholder="quantidade"
                type="number"
                value={d.quantity}
                onChange={(e) => updateDel(i, { quantity: Number(e.target.value) })}
              />
              <input
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
                placeholder="due_date (opcional) AAAA-MM-DD"
                value={d.due_date ?? ""}
                onChange={(e) => updateDel(i, { due_date: e.target.value })}
              />
            </div>
            <input
              className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
              placeholder="Requisito (ex.: 10.000 views em 14 dias)"
              value={d.requirement}
              onChange={(e) => updateDel(i, { requirement: e.target.value })}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => removeDel(i)}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800/60"
              >
                Remover
              </button>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button
            onClick={addDeliverable}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800/60"
          >
            + Adicionar entregável
          </button>

          <button
            onClick={create}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
          >
            Criar campanha
          </button>
        </div>

        {err && <p className="text-sm text-red-400">{err}</p>}
      </div>
    </div>
  );
}
