import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import OfferInquiryForm from "@/components/OfferInquiryForm";

export default async function OfertaDetalhe({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();

  const { data: offer } = await supabase
    .from("creator_offers")
    .select("id,title,description,platform,niche,language,price_from,city,state,country,is_public,is_active,creator_id")
    .eq("id", params.id)
    .eq("is_public", true)
    .eq("is_active", true)
    .maybeSingle();

  if (!offer) redirect("/vitrine");

  const { data: items } = await supabase
    .from("offer_items")
    .select("*")
    .eq("offer_id", offer.id)
    .order("sort_order", { ascending: true });

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = profile?.role ?? null;
  }

  const canRequest = role === "brand" || role === "admin";
  const location = [offer.city, offer.state, offer.country].filter(Boolean).join(" - ");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/vitrine" className="text-sm text-zinc-300 hover:text-zinc-100">
          ← Voltar para vitrine
        </Link>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <h1 className="text-2xl font-semibold">{offer.title}</h1>
          {offer.description && <p className="mt-3 text-sm text-zinc-300">{offer.description}</p>}

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
            <span className="rounded-full border border-zinc-800 px-3 py-1">{offer.platform || "-"}</span>
            <span className="rounded-full border border-zinc-800 px-3 py-1">{offer.niche || "-"}</span>
            <span className="rounded-full border border-zinc-800 px-3 py-1">{offer.language || "-"}</span>
          </div>

          {location && <div className="mt-3 text-sm text-zinc-300">Localização: {location}</div>}

          <div className="mt-4 text-sm text-zinc-300">
            Preço base: {offer.price_from ? `R$ ${Number(offer.price_from).toFixed(2)}` : "sob consulta"}
          </div>
        </div>

        <h2 className="mt-8 text-sm font-semibold text-zinc-200">Itens da oferta</h2>
        <div className="mt-3 grid gap-2">
          {(items ?? []).map((item) => (
            <div key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{item.type}</div>
                <div className="text-xs text-zinc-400">Qtd: {item.quantity}</div>
              </div>
              <div className="mt-1 text-sm text-zinc-300">{item.requirement}</div>
            </div>
          ))}
          {(!items || items.length === 0) && (
            <div className="text-sm text-zinc-300">Nenhum item cadastrado.</div>
          )}
        </div>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="text-sm font-semibold text-zinc-100">Solicitar proposta</div>
          {!user && (
            <Link
              href="/login"
              className="mt-3 inline-flex rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
            >
              Entrar para solicitar
            </Link>
          )}
          {user && canRequest && <OfferInquiryForm offerId={offer.id} />}
          {user && !canRequest && (
            <div className="mt-3 text-sm text-zinc-300">
              Apenas contas de marca podem solicitar propostas.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}