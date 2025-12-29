import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  return (
    <div>
      <h1 className="text-xl font-semibold">Pedidos enviados</h1>
      <p className="mt-1 text-sm text-zinc-300">Acompanhe as solicitações feitas na vitrine.</p>

      <div className="mt-4 grid gap-3">
        {(inquiries ?? []).map((inq) => {
          const offer = Array.isArray(inq.offer) ? inq.offer[0] : inq.offer;
          const location = [offer?.city, offer?.state].filter(Boolean).join(" - ");

          return (
            <div key={inq.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{offer?.title || "Oferta"}</div>
                  <div className="text-xs text-zinc-400">Creator: {inq.creator_id}</div>
                  {location && <div className="text-xs text-zinc-400">{location}</div>}
                </div>
                <div className="text-xs text-zinc-300">{String(inq.status).toUpperCase()}</div>
              </div>

              {inq.message && <div className="mt-2 text-sm text-zinc-300">{inq.message}</div>}
              <div className="mt-2 text-xs text-zinc-400">
                Budget: {inq.budget ? `R$ ${Number(inq.budget).toFixed(2)}` : "-"} • {new Date(inq.created_at).toLocaleString()}
              </div>
            </div>
          );
        })}

        {(!inquiries || inquiries.length === 0) && (
          <div className="text-sm text-zinc-300">Nenhum pedido enviado ainda.</div>
        )}
      </div>
    </div>
  );
}
