import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Agência/Plataforma para conectar Creators e Marcas
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-300">
          Marcas criam campanhas com entregáveis (views, menções em live, posts). Creators enviam propostas.
          Você aceita e acompanha entregas com prova e aprovação.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-zinc-900 font-medium hover:bg-white"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-100 hover:bg-zinc-900"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
