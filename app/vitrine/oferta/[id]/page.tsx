import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import OfferInquiryForm from "@/components/OfferInquiryForm";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Separator from "@/components/ui/Separator";

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
    <main className="min-h-screen bg-transparent text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/vitrine" className="text-sm text-zinc-300 hover:text-zinc-100">
          {"<-"} Voltar para vitrine
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar name="Creator" />
                <div>
                  <div className="text-sm font-semibold text-zinc-100">Creator</div>
                  <div className="text-xs text-zinc-400">Perfil verificado</div>
                </div>
                <Badge variant="verified" className="ml-auto">
                  Verificado
                </Badge>
              </div>
              <CardTitle className="mt-4 text-2xl">{offer.title}</CardTitle>
              {offer.description && <CardDescription>{offer.description}</CardDescription>}
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="platform">{offer.platform || "Platform"}</Badge>
                <Badge variant="niche">{offer.niche || "Nicho"}</Badge>
                <Badge variant="muted">{offer.language || "Idioma"}</Badge>
              </div>

              {location && (
                <div className="text-sm text-zinc-300">
                  <span className="text-zinc-400">Localizacao:</span> {location}
                </div>
              )}

              <div className="text-sm text-zinc-200">
                Preco base: {offer.price_from ? `R$ ${Number(offer.price_from).toFixed(2)}` : "sob consulta"}
              </div>

              <Separator />

              <div>
                <div className="text-sm font-semibold text-zinc-100">O que esta incluso</div>
                <div className="mt-3 grid gap-2">
                  {(items ?? []).map((item) => (
                    <div key={item.id} className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PackageIcon />
                          <span className="font-medium">{item.type}</span>
                        </div>
                        <div className="text-xs text-zinc-400">Qtd: {item.quantity}</div>
                      </div>
                      <div className="mt-2 text-sm text-zinc-300">{item.requirement}</div>
                    </div>
                  ))}
                  {(!items || items.length === 0) && (
                    <div className="text-sm text-zinc-300">Nenhum item cadastrado.</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <div>
              <div className="mb-2 text-sm font-semibold text-zinc-100">Solicitar proposta</div>
              <p className="text-xs text-zinc-400">
                Voce envia um pedido, o creator responde no painel.
              </p>
              {!user && (
                <div className="mt-3">
                  <Link href="/login">
                    <Button size="sm">Entrar para solicitar</Button>
                  </Link>
                </div>
              )}
              {user && canRequest && <OfferInquiryForm offerId={offer.id} />}
              {user && !canRequest && (
                <div className="mt-3 text-sm text-zinc-300">
                  Apenas contas de marca podem solicitar propostas.
                </div>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Confianca</CardTitle>
                <CardDescription>Sem spam: voce controla o que publica.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-300">
                Propostas ficam registradas no painel. Ajustes e negociacoes acontecem com seguranca.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function PackageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-zinc-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M3 7l9-4 9 4-9 4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}
