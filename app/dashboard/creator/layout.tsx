import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "creator" && profile.role !== "admin")) redirect("/dashboard");

  return (
    <AppShell userEmail={user.email ?? null} role="creator">
      {children}
    </AppShell>
  );
}