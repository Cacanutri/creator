import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OfferEditor from "@/components/OfferEditor";

export default async function EditOfferPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  const { data: offer } = await supabase.from("creator_offers").select("*").eq("id", params.id).single();
  if (!offer) redirect("/dashboard/creator/offers");

  if (!isAdmin && offer.creator_id !== user.id) {
    redirect("/dashboard/creator/offers");
  }

  const { data: items } = await supabase
    .from("offer_items")
    .select("*")
    .eq("offer_id", offer.id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold">Editar oferta</h1>
      <p className="mt-1 text-sm text-zinc-300">Atualize informações e itens da sua oferta.</p>
      <div className="mt-4">
        <OfferEditor mode="edit" offerId={offer.id} initialOffer={offer} initialItems={items ?? []} />
      </div>
    </div>
  );
}