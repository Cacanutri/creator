"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";

type Status = "delivered" | "closed" | "cancelled";

export default function PartnershipStatusActions({
  partnershipId,
}: {
  partnershipId: string;
}) {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: Status) {
    setError(null);
    setLoading(status);
    const { error: updateError } = await supabase
      .from("campaigns")
      .update({ status })
      .eq("id", partnershipId);
    setLoading(null);
    if (updateError) {
      setError(updateError.message);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => updateStatus("delivered")} disabled={loading !== null}>
          {loading === "delivered" ? "..." : "Marcar como entregue"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => updateStatus("closed")}
          disabled={loading !== null}
        >
          {loading === "closed" ? "..." : "Finalizar"}
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => updateStatus("cancelled")}
          disabled={loading !== null}
        >
          {loading === "cancelled" ? "..." : "Cancelar"}
        </Button>
      </div>
      {error && <Toast variant="danger">{error}</Toast>}
    </div>
  );
}
