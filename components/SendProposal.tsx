"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SendProposal({ campaignId }: { campaignId: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function send() {
    setErr(null);
    setOk(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setLoading(false);
      return router.push("/login");
    }

    const p = Number(price.replace(",", "."));
    if (!p || p <= 0) {
      setLoading(false);
      return setErr("Informe um preco valido.");
    }

    const { error } = await supabase.from("proposals").insert({
      campaign_id: campaignId,
      creator_id: user.id,
      price: p,
      message: message || null,
      status: "sent",
    });

    setLoading(false);

    if (error) return setErr(error.message);

    setOk("Proposta enviada.");
    router.refresh();
  }

  return (
    <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
      <div className="text-sm font-semibold text-zinc-200">Enviar proposta</div>

      <div className="mt-3 grid gap-3">
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
          placeholder="Preco (ex.: 1500)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <textarea
          className="min-h-20 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
          placeholder="Mensagem (ex.: entrego em 7 dias, formato, extras...)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={send}
          disabled={loading}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Enviar proposta"}
        </button>

        {err && <div className="text-sm text-red-400">{err}</div>}
        {ok && <div className="text-sm text-emerald-300">{ok}</div>}
      </div>
    </div>
  );
}
