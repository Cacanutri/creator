import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileAvatarSection from "@/components/ProfileAvatarSection";

export default async function SettingsPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-semibold">Configuracoes</h1>
        <p className="mt-1 text-sm text-zinc-300">Ajuste seu perfil e preferencias.</p>
      </div>

      <ProfileAvatarSection />
    </div>
  );
}
