import { supabaseServer } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,role,display_name")
    .eq("id", user.id)
    .single();

  return { user, profile: profile ?? null };
}
