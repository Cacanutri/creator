import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default async function BrandHome() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,campaign_type,status,created_at")
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Painel da Marca</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Gerencie parcerias e acompanhe entregas com creators.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/brand/campaigns/new">
            <Button>Nova oferta</Button>
          </Link>
          <Link href="/dashboard/brand/partnerships">
            <Button variant="secondary">Ver parcerias</Button>
          </Link>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Ultimas parcerias</h2>

      <div className="mt-3 grid gap-2">
        {(campaigns ?? []).map((c) => (
          <Link key={c.id} href={`/partnerships/${c.id}`}>
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.campaign_type || "Parceria"}</div>
                <div className="text-xs text-zinc-300">{String(c.status).toUpperCase()}</div>
              </div>
            </Card>
          </Link>
        ))}
        {(!campaigns || campaigns.length === 0) && (
          <div className="text-sm text-zinc-300">Nenhuma parceria ainda.</div>
        )}
      </div>
    </div>
  );
}
