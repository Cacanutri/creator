"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SubmitProof(props: { agreementId: string; deliverableId: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setMsg(null);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setLoading(false);
      return router.push("/login");
    }

    const { error } = await supabase.from("deliverable_submissions").insert({
      agreement_id: props.agreementId,
      deliverable_id: props.deliverableId,
      submitted_by: user.id,
      proof_url: proofUrl || null,
      proof_notes: notes || null,
      status: "submitted",
    });

    setLoading(false);
    if (error) return setMsg(error.message);

    setProofUrl("");
    setNotes("");
    setMsg("Enviado.");
    router.refresh();
  }

  return (
    <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
      <div className="text-xs text-zinc-400">Enviar prova</div>
      <input
        className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
        placeholder="Link da prova (YouTube/VOD/Drive/Timestamp)"
        value={proofUrl}
        onChange={(e) => setProofUrl(e.target.value)}
      />
      <textarea
        className="mt-2 w-full min-h-16 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
        placeholder="Notas (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        onClick={submit}
        disabled={loading}
        className="mt-2 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
      {msg && <div className="mt-2 text-xs text-zinc-300">{msg}</div>}
    </div>
  );
}
