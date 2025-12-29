import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InquiryInbox from "@/components/InquiryInbox";

export default async function BrandInquiriesPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: inquiries } = await supabase
    .from("offer_inquiries")
    .select(
      "id,status,budget,message,created_at, creator_id, offer:creator_offers(id,title,platform,niche,price_from,city,state)"
    )
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false });

  const normalized = (inquiries ?? []).map((inq) => ({
    ...inq,
    offer: Array.isArray(inq.offer) ? inq.offer[0] : inq.offer,
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold">Pedidos enviados</h1>
      <p className="mt-1 text-sm text-zinc-300">Acompanhe as solicitacoes feitas na vitrine.</p>

      <div className="mt-4">
        <InquiryInbox inquiries={normalized} role="brand" />
      </div>
    </div>
  );
}
