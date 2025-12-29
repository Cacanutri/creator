"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export type OfferItemDraft = {
  id?: string;
  type: string;
  quantity: number;
  requirement: string;
};

export type OfferDraft = {
  title: string;
  description: string;
  platform: string;
  niche: string;
  language: string;
  price_from: string;
  is_public: boolean;
  is_active: boolean;
  city: string;
  state: string;
  country: string;
  lat: string;
  lng: string;
};

type Props = {
  mode: "new" | "edit";
  offerId?: string;
  initialOffer?: Partial<OfferDraft> & {
    price_from?: number | string | null;
    lat?: number | string | null;
    lng?: number | string | null;
  };
  initialItems?: OfferItemDraft[];
};

export default function OfferEditor({ mode, offerId, initialOffer, initialItems }: Props) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const baseOffer: OfferDraft = useMemo(
    () => ({
      title: initialOffer?.title ?? "",
      description: initialOffer?.description ?? "",
      platform: initialOffer?.platform ?? "",
      niche: initialOffer?.niche ?? "",
      language: initialOffer?.language ?? "",
      price_from:
        initialOffer?.price_from !== undefined && initialOffer?.price_from !== null
          ? String(initialOffer.price_from)
          : "",
      is_public: initialOffer?.is_public ?? false,
      is_active: initialOffer?.is_active ?? true,
      city: initialOffer?.city ?? "",
      state: initialOffer?.state ?? "",
      country: initialOffer?.country ?? "BR",
      lat:
        initialOffer?.lat !== undefined && initialOffer?.lat !== null
          ? String(initialOffer.lat)
          : "",
      lng:
        initialOffer?.lng !== undefined && initialOffer?.lng !== null
          ? String(initialOffer.lng)
          : "",
    }),
    [initialOffer]
  );

  const [offer, setOffer] = useState<OfferDraft>(baseOffer);
  const [items, setItems] = useState<OfferItemDraft[]>(
    initialItems && initialItems.length
      ? initialItems.map((item) => ({
          id: item.id,
          type: item.type || "",
          quantity: item.quantity || 1,
          requirement: item.requirement || "",
        }))
      : [{ type: "", quantity: 1, requirement: "" }]
  );

  function updateOffer(patch: Partial<OfferDraft>) {
    setOffer((prev) => ({ ...prev, ...patch }));
  }

  function addItem() {
    setItems((prev) => [...prev, { type: "", quantity: 1, requirement: "" }]);
  }

  function updateItem(index: number, patch: Partial<OfferItemDraft>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setErr(null);
    setOk(null);
    setLoading(true);

    if (!offer.title.trim()) {
      setLoading(false);
      return setErr("Informe um título.");
    }

    const priceValue = offer.price_from.trim() ? Number(offer.price_from.replace(",", ".")) : null;
    if (priceValue !== null && Number.isNaN(priceValue)) {
      setLoading(false);
      return setErr("Preço inválido.");
    }

    const hasLat = offer.lat.trim().length > 0;
    const hasLng = offer.lng.trim().length > 0;
    const latValue = hasLat ? Number(offer.lat.replace(",", ".")) : null;
    const lngValue = hasLng ? Number(offer.lng.replace(",", ".")) : null;

    if (hasLat !== hasLng) {
      setLoading(false);
      return setErr("Informe latitude e longitude juntos.");
    }

    if ((hasLat && Number.isNaN(latValue)) || (hasLng && Number.isNaN(lngValue))) {
      setLoading(false);
      return setErr("Latitude/longitude inválidas.");
    }

    const payload = {
      title: offer.title,
      description: offer.description || null,
      platform: offer.platform || null,
      niche: offer.niche || null,
      language: offer.language || null,
      price_from: priceValue,
      is_public: offer.is_public,
      is_active: offer.is_active,
      city: offer.city || null,
      state: offer.state || null,
      country: offer.country || "BR",
      lat: latValue,
      lng: lngValue,
    };

    if (mode === "new") {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        setLoading(false);
        return router.push("/login");
      }

      const { data: created, error } = await supabase
        .from("creator_offers")
        .insert({ ...payload, creator_id: user.id })
        .select("id")
        .single();

      if (error || !created) {
        setLoading(false);
        return setErr(error?.message ?? "Erro ao criar oferta.");
      }

      const rows = items
        .filter((item) => item.type && item.requirement)
        .map((item, idx) => ({
          offer_id: created.id,
          type: item.type,
          quantity: item.quantity || 1,
          requirement: item.requirement,
          sort_order: idx + 1,
        }));

      if (rows.length) {
        const { error: itemError } = await supabase.from("offer_items").insert(rows);
        if (itemError) {
          setLoading(false);
          return setErr(itemError.message);
        }
      }

      setLoading(false);
      router.push(`/dashboard/creator/offers/${created.id}/edit`);
      router.refresh();
      return;
    }

    if (!offerId) {
      setLoading(false);
      return setErr("Offer ID inválido.");
    }

    const { error: updateError } = await supabase.from("creator_offers").update(payload).eq("id", offerId);
    if (updateError) {
      setLoading(false);
      return setErr(updateError.message);
    }

    await supabase.from("offer_items").delete().eq("offer_id", offerId);

    const rows = items
      .filter((item) => item.type && item.requirement)
      .map((item, idx) => ({
        offer_id: offerId,
        type: item.type,
        quantity: item.quantity || 1,
        requirement: item.requirement,
        sort_order: idx + 1,
      }));

    if (rows.length) {
      const { error: itemError } = await supabase.from("offer_items").insert(rows);
      if (itemError) {
        setLoading(false);
        return setErr(itemError.message);
      }
    }

    setLoading(false);
    setOk("Oferta salva.");
    router.refresh();
  }

  async function togglePublic() {
    if (!offerId) return;
    setLoading(true);
    const nextValue = !offer.is_public;
    const { error } = await supabase.from("creator_offers").update({ is_public: nextValue }).eq("id", offerId);
    setLoading(false);
    if (error) return setErr(error.message);
    updateOffer({ is_public: nextValue });
    router.refresh();
  }

  async function toggleActive() {
    if (!offerId) return;
    setLoading(true);
    const nextValue = !offer.is_active;
    const { error } = await supabase.from("creator_offers").update({ is_active: nextValue }).eq("id", offerId);
    setLoading(false);
    if (error) return setErr(error.message);
    updateOffer({ is_active: nextValue });
    router.refresh();
  }

  async function removeOffer() {
    if (!offerId) return;
    if (!window.confirm("Excluir oferta?")) return;
    setLoading(true);
    const { error } = await supabase.from("creator_offers").delete().eq("id", offerId);
    setLoading(false);
    if (error) return setErr(error.message);
    router.push("/dashboard/creator/offers");
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
          placeholder="Título"
          value={offer.title}
          onChange={(e) => updateOffer({ title: e.target.value })}
        />
        <textarea
          className="min-h-24 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
          placeholder="Descrição"
          value={offer.description}
          onChange={(e) => updateOffer({ description: e.target.value })}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
            placeholder="Platform"
            value={offer.platform}
            onChange={(e) => updateOffer({ platform: e.target.value })}
          />
          <input
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
            placeholder="Nicho"
            value={offer.niche}
            onChange={(e) => updateOffer({ niche: e.target.value })}
          />
          <input
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
            placeholder="Idioma"
            value={offer.language}
            onChange={(e) => updateOffer({ language: e.target.value })}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
            placeholder="Preço base (ex.: 1500)"
            value={offer.price_from}
            onChange={(e) => updateOffer({ price_from: e.target.value })}
          />
          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={offer.is_public}
                onChange={(e) => updateOffer({ is_public: e.target.checked })}
              />
              Pública
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={offer.is_active}
                onChange={(e) => updateOffer({ is_active: e.target.checked })}
              />
              Ativa
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
          <div className="text-sm font-semibold text-zinc-200">Localização</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
              placeholder="Cidade"
              value={offer.city}
              onChange={(e) => updateOffer({ city: e.target.value })}
            />
            <input
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
              placeholder="Estado"
              value={offer.state}
              onChange={(e) => updateOffer({ state: e.target.value })}
            />
            <input
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
              placeholder="País"
              value={offer.country}
              onChange={(e) => updateOffer({ country: e.target.value })}
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
              placeholder="Latitude (opcional)"
              value={offer.lat}
              onChange={(e) => updateOffer({ lat: e.target.value })}
            />
            <input
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
              placeholder="Longitude (opcional)"
              value={offer.lng}
              onChange={(e) => updateOffer({ lng: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-200">Itens</h2>
        <div className="mt-3 grid gap-3">
          {items.map((item, index) => (
            <div key={item.id ?? index} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
                  placeholder="Type (ex.: video_review)"
                  value={item.type}
                  onChange={(e) => updateItem(index, { type: e.target.value })}
                />
                <input
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
                  placeholder="Quantidade"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 1 })}
                />
                <button
                  onClick={() => removeItem(index)}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-xs hover:bg-zinc-800/60"
                >
                  Remover
                </button>
              </div>
              <input
                className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
                placeholder="Requirement"
                value={item.requirement}
                onChange={(e) => updateItem(index, { requirement: e.target.value })}
              />
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="mt-3 rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800/60"
        >
          + Adicionar item
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={save}
          disabled={loading}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>

        {mode === "edit" && (
          <>
            <button
              onClick={togglePublic}
              disabled={loading}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800/60 disabled:opacity-60"
            >
              {offer.is_public ? "Despublicar" : "Publicar"}
            </button>
            <button
              onClick={toggleActive}
              disabled={loading}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800/60 disabled:opacity-60"
            >
              {offer.is_active ? "Desativar" : "Ativar"}
            </button>
            <button
              onClick={removeOffer}
              disabled={loading}
              className="rounded-lg border border-red-700/60 px-3 py-2 text-sm text-red-300 hover:bg-red-950/30 disabled:opacity-60"
            >
              Excluir oferta
            </button>
          </>
        )}
      </div>

      {err && <div className="text-sm text-red-400">{err}</div>}
      {ok && <div className="text-sm text-emerald-300">{ok}</div>}
    </div>
  );
}