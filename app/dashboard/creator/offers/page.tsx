import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import InfoCallout from "@/components/InfoCallout";

export default async function CreatorOffersPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: offers } = await supabase
    .from("creator_offers")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Minhas ofertas</h1>
          <p className="mt-1 text-sm text-zinc-300">Gerencie ofertas publicas e privadas.</p>
        </div>
        <Link href="/dashboard/creator/offers/new">
          <Button>Nova oferta</Button>
        </Link>
      </div>

      <div className="mt-4">
        <InfoCallout
          title="Publique ofertas claras para receber mais pedidos."
          description="Ofertas completas ajudam marcas a decidir mais rapido."
          items={["Inclua entregaveis", "Preco a partir de", "Cidade/UF", "Ative e publique"]}
        />
      </div>

      <div className="mt-4 grid gap-3">
        {(offers ?? []).map((offer) => (
          <Link key={offer.id} href={`/dashboard/creator/offers/${offer.id}/edit`}>
            <Card interactive>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={offer.title} />
                  <div>
                    <div className="font-medium">{offer.title}</div>
                    <div className="text-xs text-zinc-400">
                      {offer.platform || "-"} {"•"} {offer.niche || "-"} {"•"} {offer.language || "-"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant={offer.is_public ? "success" : "muted"}>
                    {offer.is_public ? "Publica" : "Privada"}
                  </Badge>
                  <Badge variant={offer.is_active ? "success" : "danger"}>
                    {offer.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 text-sm text-zinc-300">
                A partir de {offer.price_from ? `R$ ${Number(offer.price_from).toFixed(2)}` : "sob consulta"}
              </div>
            </Card>
          </Link>
        ))}

        {(!offers || offers.length === 0) && (
          <Card>
            <div className="text-sm text-zinc-300">Voce ainda nao criou ofertas.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
