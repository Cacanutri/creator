import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "pending") redirect("/onboarding");

  if (profile.role === "creator") redirect("/dashboard/creator");
  if (profile.role === "brand") redirect("/dashboard/brand");
  if (profile.role === "admin") redirect("/dashboard/admin");

  redirect("/onboarding");
}
