import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import SubmitProof from "@/components/SubmitProof";

export default async function CreatorAgreementDetail({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: agreement } = await supabase
    .from("agreements")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!agreement) redirect("/dashboard/creator/agreements");
  if (agreement.creator_id !== user.id) redirect("/dashboard/creator/agreements");

  const { data: deliverables } = await supabase
    .from("campaign_deliverables")
    .select("*")
    .eq("campaign_id", agreement.campaign_id)
    .order("created_at", { ascending: true });

  const { data: submissions } = await supabase
    .from("deliverable_submissions")
    .select("*")
    .eq("agreement_id", agreement.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Acordo #{agreement.id.slice(0, 8)}</h1>
      <p className="mt-1 text-sm text-zinc-300">
        Valor: <span className="text-zinc-100">R$ {Number(agreement.total_value).toFixed(2)}</span>
      </p>

      <h2 className="mt-8 text-sm font-semibold text-zinc-200">Entregáveis e envio de provas</h2>
      <div className="mt-3 grid gap-3">
        {(deliverables ?? []).map((d) => {
          const related = (submissions ?? []).filter((s) => s.deliverable_id === d.id);

          return (
            <div key={d.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{d.type}</div>
                <div className="text-xs text-zinc-400">Qtd: {d.quantity}</div>
              </div>
              <div className="mt-1 text-sm text-zinc-300">{d.requirement}</div>

              <SubmitProof agreementId={agreement.id} deliverableId={d.id} />

              <div className="mt-4">
                <div className="text-xs font-semibold text-zinc-200">Submissões</div>
                <div className="mt-2 grid gap-2">
                  {related.map((s) => (
                    <div key={s.id} className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-zinc-400">{s.id.slice(0, 8)}</div>
                        <div className="text-xs text-zinc-300">{String(s.status).toUpperCase()}</div>
                      </div>
                      {s.proof_url && (
                        <a className="mt-2 block text-sm text-zinc-100 underline" href={s.proof_url} target="_blank">
                          Abrir prova
                        </a>
                      )}
                      {s.proof_notes && <div className="mt-2 text-sm text-zinc-300">{s.proof_notes}</div>}
                      {s.reviewer_notes && (
                        <div className="mt-2 text-xs text-zinc-400">Reviewer: {s.reviewer_notes}</div>
                      )}
                    </div>
                  ))}
                  {related.length === 0 && <div className="text-sm text-zinc-300">Ainda sem envio para este item.</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}