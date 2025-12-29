"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Toast from "@/components/ui/Toast";

type Proof = {
  id: string;
  proof_url?: string | null;
  note?: string | null;
  created_at?: string | null;
};

export default function PartnershipProofs({ partnershipId }: { partnershipId: string }) {
  const supabase = supabaseBrowser();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [proofUrl, setProofUrl] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProofs() {
      const { data } = await supabase
        .from("partnership_proofs")
        .select("id,proof_url,note,created_at")
        .eq("partnership_id", partnershipId)
        .order("created_at", { ascending: false });
      setProofs((data as Proof[]) ?? []);
    }

    loadProofs();
  }, [partnershipId, supabase]);

  async function addProof() {
    setError(null);
    if (!proofUrl.trim()) {
      setError("Informe o link da prova.");
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

    const { data, error: insertError } = await supabase
      .from("partnership_proofs")
      .insert({
        partnership_id: partnershipId,
        created_by: user.id,
        proof_url: proofUrl,
        note: note || null,
      })
      .select("id,proof_url,note,created_at")
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setProofs((prev) => [data as Proof, ...prev]);
    }
    setProofUrl("");
    setNote("");
  }

  return (
    <div className="grid gap-3">
      <Card className="grid gap-3">
        <div className="text-sm font-semibold text-zinc-100">Adicionar prova</div>
        <label className="grid gap-1 text-xs text-zinc-400">
          Link da prova
          <Input value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} />
        </label>
        <label className="grid gap-1 text-xs text-zinc-400">
          Observacao
          <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <Button size="sm" onClick={addProof} disabled={loading}>
          {loading ? "Enviando..." : "Adicionar prova"}
        </Button>
        {error && <Toast variant="danger">{error}</Toast>}
      </Card>

      <div className="grid gap-2">
        {proofs.map((proof) => (
          <Card key={proof.id} className="p-3">
            <div className="text-sm text-zinc-200">
              <a href={proof.proof_url ?? ""} className="text-blue-300 hover:text-blue-200">
                {proof.proof_url}
              </a>
            </div>
            {proof.note && <div className="mt-1 text-xs text-zinc-400">{proof.note}</div>}
            {proof.created_at && (
              <div className="mt-1 text-xs text-zinc-500">
                {new Date(proof.created_at).toLocaleString()}
              </div>
            )}
          </Card>
        ))}
        {proofs.length === 0 && (
          <Card className="p-3">
            <div className="text-sm text-zinc-300">Nenhuma prova adicionada ainda.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
