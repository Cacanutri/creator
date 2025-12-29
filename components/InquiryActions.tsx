"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Status = "accepted" | "rejected" | "closed";

export default function InquiryActions({ inquiryId }: { inquiryId: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [loading, setLoading] = useState<Status | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function updateStatus(status: Status) {
    setErr(null);
    setLoading(status);

    const { error } = await supabase.from("offer_inquiries").update({ status }).eq("id", inquiryId);

    setLoading(null);
    if (error) return setErr(error.message);

    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => updateStatus("accepted")}
        disabled={loading !== null}
        className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white disabled:opacity-60"
      >
        {loading === "accepted" ? "..." : "Aceitar"}
      </button>
      <button
        onClick={() => updateStatus("rejected")}
        disabled={loading !== null}
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800/60 disabled:opacity-60"
      >
        {loading === "rejected" ? "..." : "Rejeitar"}
      </button>
      <button
        onClick={() => updateStatus("closed")}
        disabled={loading !== null}
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800/60 disabled:opacity-60"
      >
        {loading === "closed" ? "..." : "Fechar"}
      </button>
      {err && <div className="text-xs text-red-400">{err}</div>}
    </div>
  );
}