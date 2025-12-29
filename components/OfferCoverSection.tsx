"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import StorageImageUploader from "@/components/StorageImageUploader";
import Toast from "@/components/ui/Toast";

type Props = {
  offerId: string;
  creatorId?: string;
};

export default function OfferCoverSection({ offerId, creatorId }: Props) {
  const supabase = supabaseBrowser();
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCover() {
      const { data } = await supabase
        .from("creator_offers")
        .select("cover_path")
        .eq("id", offerId)
        .single();
      setCoverPath(data?.cover_path ?? null);
    }

    loadCover();
  }, [offerId, supabase]);

  async function handleUploaded(newPath: string) {
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setError("Voce precisa estar logado.");
      return;
    }

    const ownerId = creatorId ?? user.id;
    const { error: updateError } = await supabase
      .from("creator_offers")
      .update({ cover_path: newPath })
      .eq("id", offerId)
      .eq("creator_id", ownerId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCoverPath(newPath);
  }

  return (
    <div data-offer-id={offerId} className="grid gap-3">
      <div className="text-sm text-zinc-300">
        Uma capa clara aumenta a taxa de solicitacao.
      </div>
      <StorageImageUploader
        bucket="offer-covers"
        currentPath={coverPath}
        onUploaded={handleUploaded}
        label="Imagem de capa"
        helperText="Use imagens horizontais para melhorar a leitura dos cards."
      />
      {error && <Toast variant="danger">{error}</Toast>}
    </div>
  );
}
