"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { buildAvatarPath, buildCoverPath, getPublicUrl } from "@/lib/supabase/storage";

type Props = {
  bucket: "avatars" | "offer-covers";
  currentPath?: string | null;
  onUploaded: (newPath: string) => void;
  label: string;
  helperText?: string;
  maxMb?: number;
  accept?: string;
};

export default function StorageImageUploader({
  bucket,
  currentPath,
  onUploaded,
  label,
  helperText,
  maxMb = 5,
  accept = "image/png,image/jpeg,image/webp",
}: Props) {
  const supabase = supabaseBrowser();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (currentPath) return getPublicUrl(bucket, currentPath);
    return null;
  }, [file, currentPath, bucket]);

  useEffect(() => {
    if (!file || !previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [file, previewUrl]);

  function validateFile(nextFile: File) {
    const allowed = accept.split(",").map((item) => item.trim());
    const isAllowed = allowed.includes(nextFile.type);
    if (!isAllowed) return "Formato nao suportado.";
    const maxBytes = maxMb * 1024 * 1024;
    if (nextFile.size > maxBytes) return `Arquivo acima de ${maxMb}MB.`;
    return null;
  }

  function extractExt(nextFile: File) {
    const fromName = nextFile.name.split(".").pop();
    if (fromName) return fromName;
    const fromType = nextFile.type.split("/").pop();
    return fromType || "jpg";
  }

  async function handleUpload() {
    setError(null);
    if (!file) {
      setError("Escolha uma imagem primeiro.");
      return;
    }

    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setLoading(false);
      setError("Voce precisa estar logado.");
      return;
    }

    const fileExt = extractExt(file);
    let path = "";

    if (bucket === "avatars") {
      path = buildAvatarPath(user.id, fileExt);
    } else {
      const offerId =
        rootRef.current?.closest("[data-offer-id]")?.getAttribute("data-offer-id") ?? "";
      if (!offerId) {
        setLoading(false);
        setError("Nao foi possivel identificar a oferta.");
        return;
      }
      path = buildCoverPath(user.id, offerId, fileExt);
    }

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });

    setLoading(false);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    setFile(null);
    onUploaded(path);
  }

  return (
    <Card className="p-4">
      <div ref={rootRef} className="grid gap-3">
        <div className="text-sm font-semibold text-zinc-100">{label}</div>
        {helperText && <div className="text-xs text-zinc-400">{helperText}</div>}

        <div className="relative h-40 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-800/60 via-zinc-900/60 to-zinc-800/30 text-xs text-zinc-400">
              <ImageIcon />
              Sem imagem
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            if (nextFile) {
              const validation = validateFile(nextFile);
              setError(validation);
            }
            setFile(nextFile);
          }}
        />

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
            Escolher imagem
          </Button>
          <Button size="sm" onClick={handleUpload} disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </Button>
        </div>

        {error && <Toast variant="danger">{error}</Toast>}
      </div>
    </Card>
  );
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 text-zinc-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-4 4-2-2-5 5" />
    </svg>
  );
}
