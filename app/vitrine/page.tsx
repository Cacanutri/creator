import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import VitrineFilters from "@/components/VitrineFilters";
import { parseCities, parseNumber } from "@/lib/utils/query";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Steps from "@/components/Steps";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import Image from "next/image";
import { getPublicUrl } from "@/lib/supabase/storage";

type SearchParams = {
  platform?: string | string[];
  niche?: string | string[];
  maxPrice?: string | string[];
  country?: string | string[];
  state?: string | string[];
  cities?: string | string[];
  radius_km?: string | string[];
  lat?: string | string[];
  lng?: string | string[];
};

type OfferRow = {
  id: string;
  creator_id: string;
  title: string;
  description?: string | null;
  platform?: string | null;
  niche?: string | null;
  language?: string | null;
  price_from?: number | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  cover_path?: string | null;
  lat?: number | null;
  lng?: number | null;
  created_at?: string | null;
  distance_m?: number | null;
  creator?: {
    id?: string;
    display_name?: string | null;
    avatar_path?: string | null;
  } | { id?: string; display_name?: string | null; avatar_path?: string | null }[] | null;
};

function pickParam(value?: string | string[]) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function VitrinePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = supabaseServer();
  const { user, profile } = await getCurrentProfile();

  const platform = pickParam(searchParams.platform) ?? null;
  const niche = pickParam(searchParams.niche) ?? null;
  const maxPrice = parseNumber(pickParam(searchParams.maxPrice)) ?? null;
  const countryParam = pickParam(searchParams.country) ?? "BR";
  const country = countryParam.trim() ? countryParam.trim() : "BR";
  const stateParam = pickParam(searchParams.state) ?? "";
  const state = stateParam.trim() ? stateParam.trim() : null;
  const cities = parseCities(pickParam(searchParams.cities)) ?? null;
  const radiusKm = parseNumber(pickParam(searchParams.radius_km)) ?? null;
  const lat = parseNumber(pickParam(searchParams.lat)) ?? null;
  const lng = parseNumber(pickParam(searchParams.lng)) ?? null;
  const countryFilter = country === "ALL" ? null : country;

  let offers: OfferRow[] = [];
  let rpcError: string | null = null;
  let usingRpc = false;

  if (radiusKm !== null && lat !== null && lng !== null) {
    const { data, error } = await supabase.rpc("search_public_offers", {
      p_platform: platform,
      p_niche: niche,
      p_max_price: maxPrice,
      p_cities: cities,
      p_state: state,
      p_country: countryFilter,
      p_lat: lat,
      p_lng: lng,
      p_radius_km: radiusKm,
    });

    if (error) {
      rpcError = "Filtro por raio indisponivel no momento.";
    } else {
      offers = (data as OfferRow[]) ?? [];
      usingRpc = true;
    }
  }

  if (!usingRpc) {
    let query = supabase
      .from("creator_offers")
      .select(
        "id,title,platform,niche,language,price_from,created_at, creator_id, city, state, country, cover_path, creator:profiles(id,display_name,avatar_path)"
      )
      .eq("is_public", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (platform) query = query.eq("platform", platform);
    if (niche) query = query.ilike("niche", `%${niche}%`);
    if (maxPrice !== null) query = query.lte("price_from", maxPrice);
    if (countryFilter) query = query.eq("country", countryFilter);
    if (state) query = query.eq("state", state);

    if (cities && cities.length) {
      const filters = cities
        .map((c) => c.replace(/,/g, "").trim())
        .filter(Boolean)
        .map((c) => `city.ilike.${c}`);
      if (filters.length) {
        query = query.or(filters.join(","));
      }
    }

    const { data } = await query;
    offers = (data as OfferRow[]) ?? [];
  }

  if (usingRpc) {
    if (countryFilter) {
      offers = offers.filter(
        (offer) => (offer.country ?? "").toLowerCase() === countryFilter.toLowerCase()
      );
    }
    if (state) {
      offers = offers.filter(
        (offer) => (offer.state ?? "").toLowerCase() === state.toLowerCase()
      );
    }
    if (cities && cities.length) {
      const citySet = new Set(cities.map((c) => c.toLowerCase()));
      offers = offers.filter((offer) => {
        const offerCity = offer.city?.toLowerCase();
        return offerCity ? citySet.has(offerCity) : false;
      });
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Vitrine de ofertas</h1>
            <p className="mt-2 text-sm text-slate-600">
              Encontre creators com filtros inteligentes e envie propostas com seguranca.
            </p>
          </div>
          <div className="text-sm text-slate-500">
            {offers ? `${offers.length} resultados` : "Carregando..."}
          </div>
        </div>

        <div className="mt-6">
          <VitrineFilters
            platform={platform}
            niche={niche}
            maxPrice={maxPrice}
            country={country}
            state={state}
            cities={cities}
            radiusKm={radiusKm}
            lat={lat}
            lng={lng}
            showRadiusWarning={Boolean(rpcError)}
          />
        </div>

        <div className="mt-8 grid gap-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Como usar a vitrine</div>
                <p className="mt-1 text-sm text-slate-600">
                  Em 3 passos voce encontra creators e inicia propostas. Ofertas com foto recebem
                  mais cliques.
                </p>
              </div>
              {user && profile?.role === "brand" && (
                <Link href="/dashboard/brand/inquiries">
                  <Button size="sm" variant="secondary">
                    Ver pedidos de proposta
                  </Button>
                </Link>
              )}
              {user && profile?.role === "creator" && (
                <Link href="/dashboard/creator/offers/new">
                  <Button size="sm" variant="secondary">
                    Criar oferta
                  </Button>
                </Link>
              )}
            </div>
            <div className="mt-4">
              <Steps
                steps={[
                  "Use filtros para encontrar creators.",
                  "Abra uma oferta e veja os entregaveis.",
                  "Clique em Solicitar proposta para iniciar.",
                ]}
              />
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(offers ?? []).map((offer) => {
            const location = [offer.city, offer.state].filter(Boolean).join(" - ");
            const distanceKm = offer.distance_m ? offer.distance_m / 1000 : null;
            const creator = (Array.isArray(offer.creator) ? offer.creator[0] : offer.creator) as
              | { display_name?: string | null; avatar_path?: string | null }
              | null
              | undefined;
            const creatorLabel = creator?.display_name ?? "Creator";
            const avatarUrl = creator?.avatar_path
              ? getPublicUrl("avatars", creator.avatar_path)
              : null;
            const coverUrl = offer.cover_path
              ? getPublicUrl("offer-covers", offer.cover_path)
              : null;

            return (
              <Card key={offer.id} interactive>
                <div className="relative h-40 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={offer.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-cyan-50 via-slate-50 to-pink-50 text-xs text-slate-500">
                      <CoverIcon />
                      Sem capa
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-slate-900/5 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-3">
                    <Avatar name={creatorLabel} src={avatarUrl} size="sm" />
                    <div>
                      <div className="text-sm font-semibold text-white">{creatorLabel}</div>
                      <div className="text-xs text-white/80">Perfil verificado</div>
                    </div>
                  </div>
                  <Badge variant="verified" className="absolute right-3 top-3">
                    Verificado
                  </Badge>
                </div>

                <div className="mt-4 text-base font-semibold">{offer.title}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="platform">{offer.platform || "Platform"}</Badge>
                  <Badge variant="niche">{offer.niche || "Nicho"}</Badge>
                </div>
                {location && <div className="mt-2 text-xs text-slate-500">{location}</div>}
                {distanceKm !== null && (
                  <div className="mt-1 text-xs text-slate-500">
                    Distancia: {distanceKm.toFixed(1)} km
                  </div>
                )}
                <div className="mt-3 text-sm text-slate-700">
                  A partir de {offer.price_from ? `R$ ${Number(offer.price_from).toFixed(2)}` : "sob consulta"}
                </div>
                <div className="mt-4">
                  <Link href={`/vitrine/oferta/${offer.id}`}>
                    <Button size="sm">Ver oferta</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {offers && offers.length === 0 && (
          <Card className="mt-8 text-center">
            <div className="text-sm text-slate-600">Nenhuma oferta encontrada com esses filtros.</div>
            <div className="mt-4">
              <Link href="/vitrine">
                <Button variant="secondary" size="sm">
                  Limpar filtros
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </main>
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
