"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) return setErr(error.message);

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="text-2xl font-semibold">Entrar</h1>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err && <p className="text-sm text-red-400">{err}</p>}

          <button
            disabled={loading}
            className="mt-2 rounded-lg bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#FF0033] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Não tem conta?{" "}
          <a className="text-slate-900 underline" href="/register">
            Cadastrar
          </a>
        </p>
      </div>
    </main>
  );
}
