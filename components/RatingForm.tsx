"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RatingForm({
  campaignId,
  toUserId,
  title,
}: {
  campaignId: string;
  toUserId: string;
  title: string;
}) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [stars, setStars] = useState("5");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setOk(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setLoading(false);
      return router.push("/login");
    }

    const { error } = await supabase.from("ratings").insert({
      campaign_id: campaignId,
      from_user_id: user.id,
      to_user_id: toUserId,
      stars: Number(stars),
      comment: comment || null,
    });

    setLoading(false);
    if (error) return setErr(error.message);

    setOk("Avaliacao enviada.");
    setComment("");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
      <div className="text-sm font-semibold text-zinc-200">{title}</div>
      <div className="mt-3 grid gap-3">
        <label className="grid gap-1 text-xs text-zinc-400">
          Nota
          <select
            value={stars}
            onChange={(e) => setStars(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm outline-none"
          >
            <option value="5">5 - Excelente</option>
            <option value="4">4 - Muito bom</option>
            <option value="3">3 - Bom</option>
            <option value="2">2 - Regular</option>
            <option value="1">1 - Ruim</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs text-zinc-400">
          Comentario (opcional)
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm outline-none"
            placeholder="Descreva como foi a parceria."
          />
        </label>
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Enviar avaliacao"}
        </button>
        {err && <div className="text-xs text-red-400">{err}</div>}
        {ok && <div className="text-xs text-emerald-300">{ok}</div>}
      </div>
    </div>
  );
}
