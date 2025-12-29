"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseCities, parseNumber } from "@/lib/utils/query";

type Props = {
  platform?: string | null;
  niche?: string | null;
  maxPrice?: number | null;
  country?: string | null;
  state?: string | null;
  cities?: string[] | null;
  radiusKm?: number | null;
  lat?: number | null;
  lng?: number | null;
  showRadiusWarning?: boolean;
};

export default function VitrineFilters({
  platform,
  niche,
  maxPrice,
  country,
  state,
  cities,
  radiusKm,
  lat,
  lng,
  showRadiusWarning,
}: Props) {
  const router = useRouter();
  const [platformValue, setPlatformValue] = useState(platform ?? "");
  const [nicheValue, setNicheValue] = useState(niche ?? "");
  const [maxPriceValue, setMaxPriceValue] = useState(maxPrice?.toString() ?? "");
  const [countryValue, setCountryValue] = useState(country ?? "BR");
  const [stateValue, setStateValue] = useState(state ?? "");
  const [citiesValue, setCitiesValue] = useState(cities?.join(", ") ?? "");
  const [radiusValue, setRadiusValue] = useState(radiusKm?.toString() ?? "");
  const [latValue, setLatValue] = useState(lat?.toString() ?? "");
  const [lngValue, setLngValue] = useState(lng?.toString() ?? "");
  const [cityRadiusValue, setCityRadiusValue] = useState("");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoWarning, setGeoWarning] = useState<string | null>(null);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const platformOptions = ["", "Instagram", "TikTok", "YouTube", "Twitch", "Kwai"];
  const normalizedPlatformOptions =
    platformValue && !platformOptions.includes(platformValue)
      ? [platformValue, ...platformOptions]
      : platformOptions;

  function pickCityFromRadius(input: string) {
    const cleaned = input.trim();
    if (!cleaned) return "";
    const splitByDash = cleaned.split("-")[0]?.trim();
    const splitByComma = splitByDash.split(",")[0]?.trim();
    return splitByComma ?? cleaned;
  }

  function buildQuery(overrides?: Partial<Record<string, string>>) {
    const params = new URLSearchParams();
    const nextPlatform = overrides?.platform ?? platformValue;
    const nextNiche = overrides?.niche ?? nicheValue;
    const nextMaxPrice = overrides?.maxPrice ?? maxPriceValue;
    const nextCountry = overrides?.country ?? countryValue;
    const nextState = overrides?.state ?? stateValue;
    const nextCities = overrides?.cities ?? citiesValue;
    const nextRadius = overrides?.radius_km ?? radiusValue;
    const nextLat = overrides?.lat ?? latValue;
    const nextLng = overrides?.lng ?? lngValue;

    if (nextPlatform.trim()) params.set("platform", nextPlatform.trim());
    if (nextNiche.trim()) params.set("niche", nextNiche.trim());

    const max = parseNumber(nextMaxPrice.trim());
    if (max !== null) params.set("maxPrice", String(max));

    const countryParam = nextCountry.trim() || "BR";
    params.set("country", countryParam);

    if (nextState.trim()) params.set("state", nextState.trim());

    const citiesArray = parseCities(nextCities);
    if (citiesArray) params.set("cities", citiesArray.join(","));

    const radius = parseNumber(nextRadius.trim());
    const radiusValueNumber = radius !== null && radius > 0 ? radius : null;
    if (radiusValueNumber !== null) params.set("radius_km", String(radiusValueNumber));

    if (radiusValueNumber !== null) {
      const latNum = parseNumber(nextLat.trim());
      const lngNum = parseNumber(nextLng.trim());
      if (latNum !== null) params.set("lat", String(latNum));
      if (lngNum !== null) params.set("lng", String(lngNum));
    }

    const qs = params.toString();
    router.push(qs ? `/vitrine?${qs}` : "/vitrine");
  }

  function clearFilters() {
    setPlatformValue("");
    setNicheValue("");
    setMaxPriceValue("");
    setCountryValue("BR");
    setStateValue("");
    setCitiesValue("");
    setRadiusValue("");
    setLatValue("");
    setLngValue("");
    setCityRadiusValue("");
    setGeoError(null);
    setGeoWarning(null);
    setGeoNotice(null);
    router.push("/vitrine");
  }

  async function applyFilters() {
    if (applyLoading) return;
    setGeoError(null);
    setGeoWarning(null);
    setGeoNotice(null);

    const radiusNumber = parseNumber(radiusValue.trim());
    const hasRadius = radiusNumber !== null && radiusNumber > 0;
    const cityRadius = cityRadiusValue.trim();

    if (hasRadius && cityRadius) {
      setApplyLoading(true);
      try {
        const response = await fetch(`/api/geocode?query=${encodeURIComponent(cityRadius)}`);
        const data = await response.json();

        if (data?.ok && data?.lat !== undefined && data?.lng !== undefined) {
          const latStr = Number(data.lat).toFixed(6);
          const lngStr = Number(data.lng).toFixed(6);
          setLatValue(latStr);
          setLngValue(lngStr);
          buildQuery({ lat: latStr, lng: lngStr, radius_km: String(radiusNumber) });
          setApplyLoading(false);
          return;
        }

        const fallbackCity = pickCityFromRadius(cityRadius);
        const fallbackCities = citiesValue.trim() ? citiesValue : fallbackCity;
        setGeoWarning(
          "Nao consegui localizar a cidade para aplicar raio. Filtrando apenas por cidade."
        );
        setLatValue("");
        setLngValue("");
        buildQuery({ radius_km: "", lat: "", lng: "", cities: fallbackCities });
        setApplyLoading(false);
        return;
      } catch (err) {
        const fallbackCity = pickCityFromRadius(cityRadius);
        const fallbackCities = citiesValue.trim() ? citiesValue : fallbackCity;
        setGeoWarning(
          "Nao consegui localizar a cidade para aplicar raio. Filtrando apenas por cidade."
        );
        setLatValue("");
        setLngValue("");
        buildQuery({ radius_km: "", lat: "", lng: "", cities: fallbackCities });
        setApplyLoading(false);
        return;
      }
    }

    buildQuery();
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError("Geolocalizacao nao disponivel neste navegador.");
      return;
    }

    setGeoError(null);
    setGeoWarning(null);
    setGeoLoading(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latStr = pos.coords.latitude.toFixed(6);
        const lngStr = pos.coords.longitude.toFixed(6);
        const radiusStr = radiusValue.trim() ? radiusValue : "25";

        setLatValue(latStr);
        setLngValue(lngStr);
        setRadiusValue(radiusStr);
        setGeoLoading(false);
        setGeoNotice("Usando sua localizacao atual (coordenadas ocultas).");
        buildQuery({ lat: latStr, lng: lngStr, radius_km: radiusStr });
      },
      () => {
        setGeoLoading(false);
        setGeoError("Nao foi possivel obter sua localizacao.");
      }
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Filtros</h2>
          <p className="text-xs text-zinc-400">
            Use cidades, raio e outros filtros para achar creators.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={useMyLocation}
            disabled={geoLoading}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800/60 disabled:opacity-60"
          >
            {geoLoading ? "Localizando..." : "Perto de mim"}
          </button>
          <button
            onClick={clearFilters}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800/60"
          >
            Limpar
          </button>
          <button
            onClick={applyFilters}
            disabled={applyLoading}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
          >
            {applyLoading ? "Aplicando..." : "Aplicar filtros"}
          </button>
        </div>
      </div>

      {showRadiusWarning && (
        <div className="mt-3 text-xs text-amber-300">
          Filtro por raio indisponivel no momento. Usando filtros padrao.
        </div>
      )}
      {geoNotice && <div className="mt-3 text-xs text-emerald-300">{geoNotice}</div>}
      {geoWarning && <div className="mt-3 text-xs text-amber-300">{geoWarning}</div>}
      {geoError && <div className="mt-3 text-xs text-red-400">{geoError}</div>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <select
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm outline-none"
          value={platformValue}
          onChange={(e) => setPlatformValue(e.target.value)}
        >
          {normalizedPlatformOptions.map((option) => (
            <option key={option || "all"} value={option}>
              {option ? option : "Platform"}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm outline-none"
          placeholder="Nicho"
          value={nicheValue}
          onChange={(e) => setNicheValue(e.target.value)}
        />
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm outline-none"
          placeholder="Preco maximo"
          value={maxPriceValue}
          onChange={(e) => setMaxPriceValue(e.target.value)}
        />
        <select
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm outline-none"
          value={countryValue}
          onChange={(e) => setCountryValue(e.target.value)}
        >
          <option value="BR">Pais: BR</option>
          <option value="ALL">Pais: Todos</option>
        </select>
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm uppercase tracking-widest outline-none"
          placeholder="Estado/UF"
          value={stateValue}
          onChange={(e) => setStateValue(e.target.value.toUpperCase())}
          maxLength={2}
        />
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm outline-none"
          placeholder="Cidades (ex.: Maceio, Recife)"
          value={citiesValue}
          onChange={(e) => setCitiesValue(e.target.value)}
        />
        <input
          type="number"
          min={1}
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm outline-none"
          placeholder="Raio (km)"
          value={radiusValue}
          onChange={(e) => setRadiusValue(e.target.value)}
        />
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm outline-none"
          placeholder="Cidade para raio (ex.: Maceio - AL)"
          value={cityRadiusValue}
          onChange={(e) => setCityRadiusValue(e.target.value)}
        />
      </div>
    </div>
  );
}
