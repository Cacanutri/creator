import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OfferEditor from "@/components/OfferEditor";

export default async function NewOfferPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-xl font-semibold">Nova oferta</h1>
      <p className="mt-1 text-sm text-zinc-300">Cadastre sua oferta e seus itens.</p>
      <div className="mt-4">
        <OfferEditor mode="new" />
      </div>
    </div>
  );
}