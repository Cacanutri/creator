import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InquiryInbox from "@/components/InquiryInbox";
import InfoCallout from "@/components/InfoCallout";

export default async function CreatorInquiriesPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: inquiries } = await supabase
    .from("offer_inquiries")
    .select(
      "id,status,budget,message,created_at, brand_id, offer:creator_offers(id,title,platform,niche,price_from,city,state)"
    )
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  const normalized = (inquiries ?? []).map((inq) => ({
    ...inq,
    offer: Array.isArray(inq.offer) ? inq.offer[0] : inq.offer,
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold">Pedidos de proposta</h1>
      <p className="mt-1 text-sm text-zinc-300">Mensagens de marcas interessadas nas suas ofertas.</p>

      <div className="mt-4">
        <InfoCallout
          title="Aqui chegam os pedidos de proposta."
          description="Responda rapido para aumentar conversao."
          items={["Aceite ou recuse", "Peca detalhes", "Feche e marque como concluido"]}
        />
      </div>

      <div className="mt-4">
        <InquiryInbox inquiries={normalized} role="creator" />
      </div>
    </div>
  );
}
