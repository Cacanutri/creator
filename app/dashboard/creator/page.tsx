import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default async function CreatorHome() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,campaign_type,status,created_at")
    .eq("creator_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold">Painel do Creator</h1>
        <p className="mt-1 text-sm text-zinc-300">
          Aqui aparecem campanhas que voce ganhou, em andamento e finalizadas.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard/creator/campaigns">
          <Button>Ver campanhas</Button>
        </Link>
        <Link href="/vitrine/campaigns">
          <Button variant="secondary">Vitrine de campanhas</Button>
        </Link>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Campanhas recentes</h2>
      <div className="mt-3 grid gap-2">
        {(campaigns ?? []).map((c) => (
          <Link key={c.id} href={`/dashboard/creator/campaigns/${c.id}`}>
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.campaign_type || "Campanha"}</div>
                <div className="text-xs text-zinc-300">{String(c.status).toUpperCase()}</div>
              </div>
            </Card>
          </Link>
        ))}
        {(!campaigns || campaigns.length === 0) && (
          <div className="text-sm text-zinc-300">Sem campanhas ainda.</div>
        )}
      </div>
    </div>
  );
}
