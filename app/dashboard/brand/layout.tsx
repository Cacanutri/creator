import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "brand" && profile.role !== "admin")) redirect("/dashboard");

  return (
    <AppShell userEmail={user.email ?? null} role="brand">
      {children}
    </AppShell>
  );
}
