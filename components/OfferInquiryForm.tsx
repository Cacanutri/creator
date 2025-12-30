"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Toast from "@/components/ui/Toast";

export default function OfferInquiryForm({ offerId }: { offerId: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setOk(null);
    setBudgetError(null);
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
      setBudgetError("Informe um budget valido.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("offer_inquiries").insert({
      offer_id: offerId,
      budget: budgetValue,
      message: message || null,
    });

    setLoading(false);

    if (error) return setErr(error.message);

    setOk("Solicitacao enviada. Propostas ficam registradas no painel.");
    setBudget("");
    setMessage("");
    router.refresh();
  }

  return (
    <Card className="mt-4">
      <div className="grid gap-3">
        <label className="grid gap-1 text-xs text-slate-600">
          Budget (opcional)
          <Input
            placeholder="Ex.: 1500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          {budgetError && <span className="text-xs text-red-300">{budgetError}</span>}
        </label>
        <label className="grid gap-1 text-xs text-slate-600">
          Mensagem (opcional)
          <Textarea
            rows={4}
            placeholder="Conte rapidamente sobre a sua campanha."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>

        <Button onClick={submit} disabled={loading}>
          {loading ? "Enviando..." : "Solicitar proposta"}
        </Button>
        <div className="text-xs text-slate-500">Voce podera acompanhar no painel.</div>

        {err && <Toast variant="danger">{err}</Toast>}
        {ok && <Toast variant="success">{ok}</Toast>}
      </div>
    </Card>
  );
}
