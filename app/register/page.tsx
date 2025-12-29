"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function RegisterPage() {
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

    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) return setErr(error.message);

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="text-2xl font-semibold">Criar conta</h1>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <input
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err && <p className="text-sm text-red-400">{err}</p>}

          <button
            disabled={loading}
            className="mt-2 rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
          >
            {loading ? "Criando..." : "Cadastrar"}
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-300">
          Já tem conta?{" "}
          <a className="text-zinc-100 underline" href="/login">
            Entrar
          </a>
        </p>
      </div>
    </main>
  );
}
