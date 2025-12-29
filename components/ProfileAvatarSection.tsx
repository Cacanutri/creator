"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import Toast from "@/components/ui/Toast";
import StorageImageUploader from "@/components/StorageImageUploader";
import { getPublicUrl } from "@/lib/supabase/storage";

type Profile = {
  id: string;
  display_name?: string | null;
  avatar_path?: string | null;
};

export default function ProfileAvatarSection() {
  const supabase = supabaseBrowser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("id,display_name,avatar_path")
        .eq("id", user.id)
        .single();

      setProfile(data ?? null);
    }

    loadProfile();
  }, [supabase]);

  async function handleUploaded(newPath: string) {
    setError(null);
    if (!profile) return;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_path: newPath })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setProfile({ ...profile, avatar_path: newPath });
  }

  const avatarUrl = profile?.avatar_path ? getPublicUrl("avatars", profile.avatar_path) : null;

  return (
    <Card className="grid gap-4">
      <div className="flex items-center gap-4">
        <Avatar name={profile?.display_name ?? "Usuario"} src={avatarUrl} size="lg" />
        <div>
          <div className="text-sm font-semibold text-zinc-100">Foto de perfil</div>
          <div className="text-sm text-zinc-300">Sua foto aumenta a taxa de resposta.</div>
        </div>
      </div>

      <StorageImageUploader
        bucket="avatars"
        currentPath={profile?.avatar_path ?? null}
        onUploaded={handleUploaded}
        label="Atualize sua foto"
        helperText="Formatos aceitos: PNG, JPG ou WEBP."
      />

      {error && <Toast variant="danger">{error}</Toast>}
    </Card>
  );
}
