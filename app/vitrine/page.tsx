import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import VitrineFilters from "@/components/VitrineFilters";
import { parseCities, parseNumber } from "@/lib/utils/query";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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
  lat?: number | null;
  lng?: number | null;
  created_at?: string | null;
  distance_m?: number | null;
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
      .select("id,title,platform,niche,language,price_from,created_at, creator_id, city, state, country")
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
    <main className="min-h-screen bg-transparent text-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Vitrine de ofertas</h1>
            <p className="mt-2 text-sm text-zinc-300">
              Encontre creators com filtros inteligentes e envie propostas com seguranca.
            </p>
          </div>
          <div className="text-sm text-zinc-400">
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(offers ?? []).map((offer) => {
            const location = [offer.city, offer.state].filter(Boolean).join(" - ");
            const distanceKm = offer.distance_m ? offer.distance_m / 1000 : null;
            const creatorLabel = "Creator";

            return (
              <Card key={offer.id} interactive>
                <div className="flex items-center gap-3">
                  <Avatar name={creatorLabel} />
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{creatorLabel}</div>
                    <div className="text-xs text-zinc-400">Perfil verificado</div>
                  </div>
                  <Badge variant="verified" className="ml-auto">
                    Verificado
                  </Badge>
                </div>

                <div className="mt-4 text-base font-semibold">{offer.title}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="platform">{offer.platform || "Platform"}</Badge>
                  <Badge variant="niche">{offer.niche || "Nicho"}</Badge>
                </div>
                {location && <div className="mt-2 text-xs text-zinc-400">{location}</div>}
                {distanceKm !== null && (
                  <div className="mt-1 text-xs text-zinc-300">
                    Distancia: {distanceKm.toFixed(1)} km
                  </div>
                )}
                <div className="mt-3 text-sm text-zinc-200">
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
            <div className="text-sm text-zinc-300">Nenhuma oferta encontrada com esses filtros.</div>
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
