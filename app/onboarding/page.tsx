"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type Role = "creator" | "brand";

export default function OnboardingPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      setLoading(false);
    })();
  }, [router, supabase]);

  async function choose(role: Role) {
    setErr(null);
    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error: e1 } = await supabase
      .from("profiles")
      .update({ role, display_name: displayName || null })
      .eq("id", user.id);

    if (e1) {
      setLoading(false);
      return setErr(e1.message);
    }

    if (role === "creator") {
      const { error: e2 } = await supabase.from("creator_profiles").upsert({ user_id: user.id });
      if (e2) {
        setLoading(false);
        return setErr(e2.message);
      }
    } else {
      const { error: e2 } = await supabase.from("brand_profiles").upsert({ user_id: user.id });
      if (e2) {
        setLoading(false);
        return setErr(e2.message);
      }
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  if (loading) return <main className="min-h-screen bg-slate-50 text-slate-900 p-6">Carregando...</main>;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-xl px-4 py-14">
        <h1 className="text-2xl font-semibold">Onboarding</h1>
        <p className="mt-2 text-slate-600">
          Escolha o tipo de conta para liberar o painel correto.
        </p>

        <div className="mt-6 grid gap-3">
          <label className="text-sm text-slate-600">Nome (opcional)</label>
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
            placeholder="Ex.: Marcel Malta"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        {err && <p className="mt-4 text-sm text-red-400">{err}</p>}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => choose("creator")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="font-semibold">Sou Creator</div>
            <div className="mt-1 text-sm text-slate-600">Envia propostas e entrega parcerias.</div>
          </button>

          <button
            onClick={() => choose("brand")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="font-semibold">Sou Marca</div>
            <div className="mt-1 text-sm text-slate-600">Cria parcerias e aprova entregas.</div>
          </button>
        </div>
      </div>
    </main>
  );
}
