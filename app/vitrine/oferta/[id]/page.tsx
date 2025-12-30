import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import OfferInquiryForm from "@/components/OfferInquiryForm";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Separator from "@/components/ui/Separator";
import Image from "next/image";
import { getPublicUrl } from "@/lib/supabase/storage";

export default async function OfertaDetalhe({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();

  const { data: offer } = await supabase
    .from("creator_offers")
    .select(
      "id,title,description,platform,niche,language,price_from,city,state,country,is_public,is_active,creator_id,cover_path, creator:profiles(id,display_name,avatar_path)"
    )
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
  const creator = (Array.isArray(offer.creator) ? offer.creator[0] : offer.creator) as
    | { display_name?: string | null; avatar_path?: string | null }
    | null
    | undefined;
  const creatorName = creator?.display_name ?? "Creator";
  const avatarUrl = creator?.avatar_path ? getPublicUrl("avatars", creator.avatar_path) : null;
  const coverUrl = offer.cover_path ? getPublicUrl("offer-covers", offer.cover_path) : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/vitrine" className="text-sm text-slate-600 hover:text-slate-900">
          {"<-"} Voltar para vitrine
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <div className="relative h-48 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt={offer.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-cyan-50 via-slate-50 to-pink-50 text-xs text-slate-500">
                    <CoverIcon />
                    Sem capa
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-slate-900/10 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <Avatar name={creatorName} src={avatarUrl} size="lg" />
                  <div>
                    <div className="text-sm font-semibold text-white">{creatorName}</div>
                    <div className="text-xs text-white/80">Perfil verificado</div>
                  </div>
                </div>
                <Badge variant="verified" className="absolute right-4 top-4">
                  Verificado
                </Badge>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Avatar name={creatorName} src={avatarUrl} />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{creatorName}</div>
                  <div className="text-xs text-slate-500">Criador na plataforma</div>
                </div>
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
                <div className="text-sm text-slate-600">
                  <span className="text-slate-500">Localizacao:</span> {location}
                </div>
              )}

              <div className="text-sm text-slate-700">
                Preco base: {offer.price_from ? `R$ ${Number(offer.price_from).toFixed(2)}` : "sob consulta"}
              </div>

              <Separator />

              <div>
                <div className="text-sm font-semibold text-slate-900">O que esta incluso</div>
                <div className="mt-3 grid gap-2">
                  {(items ?? []).map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PackageIcon />
                          <span className="font-medium">{item.type}</span>
                        </div>
                        <div className="text-xs text-slate-500">Qtd: {item.quantity}</div>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">{item.requirement}</div>
                    </div>
                  ))}
                  {(!items || items.length === 0) && (
                    <div className="text-sm text-slate-600">Nenhum item cadastrado.</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-900">Solicitar proposta</div>
              <p className="text-xs text-slate-500">
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
                <div className="mt-3 text-sm text-slate-600">
                  Apenas contas de marca podem solicitar propostas.
                </div>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Confianca</CardTitle>
                <CardDescription>Sem spam: voce controla o que publica.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
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
      className="h-4 w-4 text-slate-500"
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

function CoverIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 text-slate-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-4 4-2-2-5 5" />
    </svg>
  );
}
