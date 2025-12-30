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

type PlatformKey = "tiktok" | "instagram" | "facebook" | "youtube";

const PLATFORM_OPTIONS: { id: PlatformKey; label: string; hint: string }[] = [
  { id: "tiktok", label: "TikTok", hint: "Videos curtos com bonus por performance" },
  { id: "instagram", label: "Instagram", hint: "Posts e reels com CTA" },
  { id: "facebook", label: "Facebook", hint: "Conteudo + trafego para link" },
  { id: "youtube", label: "YouTube", hint: "Videos longos e shorts" },
];

const PLATFORM_PRESETS: Record<
  PlatformKey,
  {
    title: string;
    objective: string;
    description: string;
    deliverables: DeliverableDraft[];
  }
> = {
  tiktok: {
    title: "Campanha de vendas produto",
    objective: "Aumentar vendas com bonus por performance",
    description:
      "Procuramos creator de conteudo para divulgar produto. Bonus por vendas e acessos no link do creator.",
    deliverables: [
      { type: "bonus_sales", quantity: 1, requirement: "Bonus a cada 20 vendas: R$ X" },
      { type: "bonus_clicks", quantity: 1, requirement: "Bonus a cada 100 acessos no link: R$ X" },
      { type: "video_short", quantity: 5, requirement: "5 videos de 30s com 15s de produto" },
    ],
  },
  instagram: {
    title: "Campanha Instagram",
    objective: "Reels + stories com CTA para link",
    description: "Conteudo com foco em conversao e alcance organico.",
    deliverables: [
      { type: "reel", quantity: 3, requirement: "3 reels de 30s com CTA para link" },
      { type: "stories", quantity: 6, requirement: "6 stories com link e call to action" },
    ],
  },
  facebook: {
    title: "Campanha Facebook",
    objective: "Gerar acessos e conversoes no link",
    description: "Conteudo com foco em alcance e cliques.",
    deliverables: [
      { type: "post", quantity: 3, requirement: "3 posts com CTA para link" },
      { type: "video_short", quantity: 2, requirement: "2 videos curtos de produto" },
    ],
  },
  youtube: {
    title: "Campanha YouTube",
    objective: "Videos com demonstracao de produto",
    description: "Videos com review e CTA para link do produto.",
    deliverables: [
      { type: "video_long", quantity: 1, requirement: "1 video de 6-8 minutos com review" },
      { type: "shorts", quantity: 3, requirement: "3 shorts de 30-45s com CTA" },
    ],
  },
};

export default function NewCampaign() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [platform, setPlatform] = useState<PlatformKey>("tiktok");
  const [title, setTitle] = useState(PLATFORM_PRESETS.tiktok.title);
  const [objective, setObjective] = useState(PLATFORM_PRESETS.tiktok.objective);
  const [description, setDescription] = useState(PLATFORM_PRESETS.tiktok.description);
  const [budget, setBudget] = useState<string>("");

  const [status, setStatus] = useState<"draft" | "open">("draft");

  const [deliverables, setDeliverables] = useState<DeliverableDraft[]>(
    PLATFORM_PRESETS.tiktok.deliverables
  );

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function applyPreset(nextPlatform: PlatformKey) {
    const preset = PLATFORM_PRESETS[nextPlatform];
    setPlatform(nextPlatform);
    setTitle(preset.title);
    setObjective(preset.objective);
    setDescription(preset.description);
    setDeliverables(preset.deliverables);
  }

  function addDeliverable() {
    setDeliverables((d) => [...d, { type: "", quantity: 1, requirement: "" }]);
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
        platform,
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
      <p className="mt-1 text-sm text-zinc-300">
        Defina o modelo, ajuste detalhes e publique para creators enviarem propostas.
      </p>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-200">Plataforma</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((option) => {
            const selected = platform === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => applyPreset(option.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selected ? "border-zinc-100 bg-zinc-100 text-zinc-900" : "border-zinc-700 text-zinc-200"
                }`}
              >
                {option.label}
                <span className="ml-2 text-xs text-zinc-400">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
          placeholder="Titulo (ex.: Publi canal de futebol)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
          placeholder="Objetivo (ex.: vendas, trafego, leads)"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
        />

        <textarea
          className="min-h-24 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
          placeholder="Descricao / briefing"
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

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Entregaveis</h2>

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
                type="date"
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
            + Adicionar entregavel
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
