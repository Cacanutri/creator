import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = supabaseServer();

  const { data: users } = await supabase
    .from("profiles")
    .select("id,role,display_name,created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div>
      <h1 className="text-xl font-semibold">Admin</h1>
      <p className="mt-1 text-sm text-zinc-300">Lista rápida de usuários (MVP).</p>

      <div className="mt-4 grid gap-2">
        {(users ?? []).map((u) => (
          <div key={u.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">{u.display_name || u.id}</div>
              <div className="text-xs text-zinc-300">{String(u.role).toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}