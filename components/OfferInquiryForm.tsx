"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OfferInquiryForm({ offerId }: { offerId: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setOk(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setLoading(false);
      return router.push("/login");
    }

    const { data: profile, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError) {
      setLoading(false);
      return setErr(roleError.message);
    }

    if (profile?.role !== "brand" && profile?.role !== "admin") {
      setLoading(false);
      return setErr("Apenas marcas podem solicitar propostas.");
    }

    const budgetValue = budget.trim() ? Number(budget.replace(",", ".")) : null;
    if (budgetValue !== null && Number.isNaN(budgetValue)) {
      setLoading(false);
      return setErr("Informe um budget válido.");
    }

    const { error } = await supabase.from("offer_inquiries").insert({
      offer_id: offerId,
      budget: budgetValue,
      message: message || null,
    });

    setLoading(false);

    if (error) return setErr(error.message);

    setOk("Solicitação enviada.");
    setBudget("");
    setMessage("");
    router.refresh();
  }

  return (
    <div className="mt-3 grid gap-3">
      <input
        className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
        placeholder="Budget estimado (opcional)"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      />
      <textarea
        className="min-h-20 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
        placeholder="Mensagem (opcional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={submit}
        disabled={loading}
        className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Solicitar proposta"}
      </button>
      {err && <div className="text-sm text-red-400">{err}</div>}
      {ok && <div className="text-sm text-emerald-300">{ok}</div>}
    </div>
  );
}