import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function CreatorAgreements() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: agreements } = await supabase
    .from("agreements")
    .select("id,campaign_id,brand_id,total_value,status,created_at")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Meus acordos</h1>

      <div className="mt-4 grid gap-2">
        {(agreements ?? []).map((a) => (
          <Link
            key={a.id}
            href={`/dashboard/creator/agreements/${a.id}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 hover:bg-zinc-900/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Acordo #{a.id.slice(0, 8)}</div>
                <div className="text-xs text-zinc-400">Marca: {a.brand_id}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-300">{String(a.status).toUpperCase()}</div>
                <div className="text-sm font-medium">R$ {Number(a.total_value).toFixed(2)}</div>
              </div>
            </div>
          </Link>
        ))}

        {(!agreements || agreements.length === 0) && (
          <div className="text-sm text-zinc-300">Nenhum acordo ainda.</div>
        )}
      </div>
    </div>
  );
}