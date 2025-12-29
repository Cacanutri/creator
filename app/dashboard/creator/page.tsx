import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default async function CreatorHome() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: partnerships } = await supabase
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
          Acompanhe parcerias e organize suas entregas.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard/creator/partnerships">
          <Button>Minhas parcerias</Button>
        </Link>
        <Link href="/dashboard/creator/offers">
          <Button variant="secondary">Minhas ofertas</Button>
        </Link>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Parcerias recentes</h2>
      <div className="mt-3 grid gap-2">
        {(partnerships ?? []).map((p) => (
          <Link key={p.id} href={`/partnerships/${p.id}`}>
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{p.campaign_type || "Parceria"}</div>
                <div className="text-xs text-zinc-300">{String(p.status).toUpperCase()}</div>
              </div>
            </Card>
          </Link>
        ))}
        {(!partnerships || partnerships.length === 0) && (
          <div className="text-sm text-zinc-300">Sem parcerias ainda.</div>
        )}
      </div>
    </div>
  );
}
