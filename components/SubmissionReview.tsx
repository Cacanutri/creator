"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SubmissionReview(props: { submissionId: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function setStatus(status: "approved" | "rejected") {
    setLoading(true);
    await supabase
      .from("deliverable_submissions")
      .update({ status, reviewer_notes: notes || null, reviewed_at: new Date().toISOString() })
      .eq("id", props.submissionId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
      <label className="text-xs text-zinc-400">Notas do revisor (opcional)</label>
      <textarea
        className="mt-2 w-full min-h-16 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 outline-none"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ex.: ajustar CTA / enviar print do analytics..."
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setStatus("approved")}
          disabled={loading}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
        >
          Aprovar
        </button>
        <button
          onClick={() => setStatus("rejected")}
          disabled={loading}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800/60 disabled:opacity-60"
        >
          Rejeitar
        </button>
      </div>
    </div>
  );
}
