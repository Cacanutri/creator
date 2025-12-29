"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";

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
      <Button
        onClick={() => updateStatus("accepted")}
        disabled={loading !== null}
        size="sm"
      >
        {loading === "accepted" ? "..." : "Aceitar"}
      </Button>
      <Button
        onClick={() => updateStatus("rejected")}
        disabled={loading !== null}
        size="sm"
        variant="secondary"
      >
        {loading === "rejected" ? "..." : "Rejeitar"}
      </Button>
      <Button
        onClick={() => updateStatus("closed")}
        disabled={loading !== null}
        size="sm"
        variant="ghost"
      >
        {loading === "closed" ? "..." : "Fechar"}
      </Button>
      {err && <Toast variant="danger">{err}</Toast>}
    </div>
  );
}
