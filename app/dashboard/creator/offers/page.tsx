import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CreatorOffersPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: offers } = await supabase
    .from("creator_offers")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Minhas ofertas</h1>
          <p className="mt-1 text-sm text-zinc-300">Gerencie suas ofertas públicas ou privadas.</p>
        </div>
        <Link
          href="/dashboard/creator/offers/new"
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          Nova oferta
        </Link>
      </div>

      <div className="mt-4 grid gap-3">
        {(offers ?? []).map((offer) => (
          <Link
            key={offer.id}
            href={`/dashboard/creator/offers/${offer.id}/edit`}
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium">{offer.title}</div>
                <div className="text-xs text-zinc-400">
                  {offer.platform || "-"} • {offer.niche || "-"} • {offer.language || "-"}
                </div>
              </div>
              <div className="text-xs text-zinc-300">
                {offer.is_public ? "PUBLICA" : "PRIVADA"} • {offer.is_active ? "ATIVA" : "INATIVA"}
              </div>
            </div>
            <div className="mt-2 text-sm text-zinc-300">
              A partir de {offer.price_from ? `R$ ${Number(offer.price_from).toFixed(2)}` : "sob consulta"}
            </div>
          </Link>
        ))}

        {(!offers || offers.length === 0) && (
          <div className="text-sm text-zinc-300">Você ainda não criou ofertas.</div>
        )}
      </div>
    </div>
  );
}