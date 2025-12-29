import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PartnershipList from "@/components/PartnershipList";

export default async function BrandPartnershipsPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: partnerships } = await supabase
    .from("campaigns")
    .select(
      "id,campaign_type,status,platform,start_date,end_date,geo_state,geo_cities,inquiry:offer_inquiries(id, offer:creator_offers(title,city,state))"
    )
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Parcerias</h1>
      <p className="mt-1 text-sm text-zinc-300">
        Fluxo claro: Oferta → Pedido de proposta → Aceite → Parceria → Entrega → Finalizacao.
      </p>

      <div className="mt-4">
        <PartnershipList partnerships={(partnerships ?? []) as any[]} />
      </div>
    </div>
  );
}
