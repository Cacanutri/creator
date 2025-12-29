"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Toast from "@/components/ui/Toast";
import OfferCoverSection from "@/components/OfferCoverSection";

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
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; price?: string }>({});

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
    setFieldErrors({});
    setLoading(true);

    if (!offer.title.trim()) {
      setLoading(false);
      setFieldErrors({ title: "Informe um titulo." });
      return;
    }

    const priceValue = offer.price_from.trim() ? Number(offer.price_from.replace(",", ".")) : null;
    if (priceValue !== null && Number.isNaN(priceValue)) {
      setLoading(false);
      setFieldErrors({ price: "Preco invalido." });
      return;
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
      return setErr("Latitude/longitude invalidas.");
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
      return setErr("Offer ID invalido.");
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
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Basico</CardTitle>
          <CardDescription>Informacoes principais da sua oferta.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <label className="grid gap-1 text-xs text-zinc-400">
            Titulo
            <Input value={offer.title} onChange={(e) => updateOffer({ title: e.target.value })} />
            {fieldErrors.title && <span className="text-xs text-red-300">{fieldErrors.title}</span>}
          </label>
          <label className="grid gap-1 text-xs text-zinc-400">
            Descricao
            <Textarea
              rows={4}
              value={offer.description}
              onChange={(e) => updateOffer({ description: e.target.value })}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segmento</CardTitle>
          <CardDescription>Defina plataforma e nicho para facilitar a busca.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs text-zinc-400">
            Platform
            <Input value={offer.platform} onChange={(e) => updateOffer({ platform: e.target.value })} />
          </label>
          <label className="grid gap-1 text-xs text-zinc-400">
            Nicho
            <Input value={offer.niche} onChange={(e) => updateOffer({ niche: e.target.value })} />
          </label>
          <label className="grid gap-1 text-xs text-zinc-400">
            Idioma
            <Input value={offer.language} onChange={(e) => updateOffer({ language: e.target.value })} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preco e status</CardTitle>
          <CardDescription>Controle visibilidade e disponibilidade da oferta.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="grid gap-1 text-xs text-zinc-400">
            Preco base
            <Input
              placeholder="Ex.: 1500"
              value={offer.price_from}
              onChange={(e) => updateOffer({ price_from: e.target.value })}
            />
            {fieldErrors.price && <span className="text-xs text-red-300">{fieldErrors.price}</span>}
          </label>
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={offer.is_public}
                onChange={(e) => updateOffer({ is_public: e.target.checked })}
              />
              Publica
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localizacao</CardTitle>
          <CardDescription>Ajude marcas a encontrar creators na sua regiao.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs text-zinc-400">
            Cidade
            <Input value={offer.city} onChange={(e) => updateOffer({ city: e.target.value })} />
          </label>
          <label className="grid gap-1 text-xs text-zinc-400">
            Estado/UF
            <Input value={offer.state} onChange={(e) => updateOffer({ state: e.target.value })} />
          </label>
          <label className="grid gap-1 text-xs text-zinc-400">
            Pais
            <Input value={offer.country} onChange={(e) => updateOffer({ country: e.target.value })} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imagem de capa</CardTitle>
          <CardDescription>Uma capa clara aumenta a taxa de solicitacao.</CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "edit" && offerId ? (
            <OfferCoverSection offerId={offerId} />
          ) : (
            <div className="text-sm text-zinc-300">
              Apos salvar, voce pode adicionar a capa da oferta.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens do pacote</CardTitle>
          <CardDescription>Liste entregaveis e requisitos da oferta.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {items.map((item, index) => (
            <div key={item.id ?? index} className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1 text-xs text-zinc-400">
                  Tipo
                  <Input
                    placeholder="Ex.: video_review"
                    value={item.type}
                    onChange={(e) => updateItem(index, { type: e.target.value })}
                  />
                </label>
                <label className="grid gap-1 text-xs text-zinc-400">
                  Quantidade
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 1 })}
                  />
                </label>
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                    Remover
                  </Button>
                </div>
              </div>
              <label className="mt-3 grid gap-1 text-xs text-zinc-400">
                Requisito
                <Input
                  value={item.requirement}
                  onChange={(e) => updateItem(index, { requirement: e.target.value })}
                />
              </label>
            </div>
          ))}

          <Button variant="secondary" size="sm" onClick={addItem}>
            + Adicionar item
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>

        {mode === "edit" && (
          <>
            <Button onClick={togglePublic} disabled={loading} variant="secondary">
              {offer.is_public ? "Despublicar" : "Publicar"}
            </Button>
            <Button onClick={toggleActive} disabled={loading} variant="ghost">
              {offer.is_active ? "Desativar" : "Ativar"}
            </Button>
            <Button onClick={removeOffer} disabled={loading} variant="danger">
              Excluir oferta
            </Button>
          </>
        )}
      </div>

      {err && <Toast variant="danger">{err}</Toast>}
      {ok && <Toast variant="success">{ok}</Toast>}
    </div>
  );
}
