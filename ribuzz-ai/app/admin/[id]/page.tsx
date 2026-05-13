import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRole } from "@/lib/supabase/server";
import { ScoreCard } from "@/components/results/ScoreCard";
import { PlaybookAccordion } from "@/components/results/PlaybookAccordion";
import { StatusDropdown } from "@/components/admin/StatusDropdown";
import { Badge } from "@/components/ui/Badge";
import type { ScorerVariable, PlaybookAccion } from "@/lib/types";

const VARIABLES_ORDER: ScorerVariable[] = [
  "problema", "solucion", "icp", "cliente_actual", "oferta", "ecuacion_valor",
  "ticket_medio", "recurrencia", "canal_adquisicion", "cac", "conversion",
  "seguimiento", "escalamiento", "capacidad_ejecucion"
];

export const dynamic = "force-dynamic";

export default async function AdminDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServiceRole();

  const { data: d } = await supabase
    .from("diagnostics")
    .select("*, companies(*, users(*))")
    .eq("id", params.id)
    .maybeSingle();

  if (!d) notFound();

  const [score, report, playbook, lead] = await Promise.all([
    supabase.from("scores").select("*").eq("diagnostic_id", params.id).maybeSingle(),
    supabase.from("reports").select("*").eq("diagnostic_id", params.id).maybeSingle(),
    supabase.from("playbooks").select("*").eq("diagnostic_id", params.id).maybeSingle(),
    supabase.from("leads").select("*").eq("diagnostic_id", params.id).maybeSingle()
  ]);

  const company = (d as any).companies;
  const owner = company?.users;

  return (
    <main className="ribuzz-shell mx-auto max-w-5xl px-6 py-10">
      <Link href="/admin" className="text-sm text-ribuzz-accent">← Volver</Link>

      <header className="mt-4">
        <h1 className="text-2xl font-bold">{company?.name}</h1>
        <p className="text-sm text-ribuzz-muted">
          {company?.sector} · {company?.city} · Contacto: {owner?.email} · {owner?.whatsapp}
        </p>
      </header>

      {/* Clasificación AI */}
      {lead.data && (
        <section className="glow-card mt-6 rounded-3xl p-5">
          <h2 className="text-lg font-semibold">Clasificación AI (P5)</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge tone="info">status: {lead.data.status ?? "—"}</Badge>
            <Badge tone="warning">fit: {lead.data.fit_level ?? "—"}</Badge>
            <Badge>urgencia: {lead.data.urgency ?? "—"}</Badge>
            <Badge>pago: {lead.data.payment_capacity ?? "—"}</Badge>
            <Badge>ejecución: {lead.data.execution_capacity ?? "—"}</Badge>
          </div>
          <p className="mt-3 text-sm text-ribuzz-muted">{lead.data.justificacion}</p>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm">
            <p className="font-semibold">Mensaje sugerido:</p>
            <p className="mt-1 whitespace-pre-line">{lead.data.opening_message}</p>
          </div>
          <div className="mt-4">
            <p className="mb-1 text-xs font-semibold uppercase">Status del lead</p>
            <StatusDropdown diagnosticId={params.id} initial={lead.data.status} />
          </div>
        </section>
      )}

      {/* Score */}
      {score.data && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Score · global {Number(score.data.score_global ?? 0).toFixed(1)}/5</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VARIABLES_ORDER.map((v) => (
              <ScoreCard key={v} variable={v} score={(score.data as any)[v] ?? 0} />
            ))}
          </div>
        </section>
      )}

      {/* Report */}
      {report.data && (
        <section className="glow-card mt-6 rounded-3xl p-5">
          <h2 className="text-lg font-semibold">Reporte</h2>
          <p className="mt-3 whitespace-pre-line text-sm">{report.data.situacion_actual}</p>
        </section>
      )}

      {/* Playbook */}
      {playbook.data && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Playbook</h2>
          <PlaybookAccordion acciones={(playbook.data.acciones ?? []) as PlaybookAccion[]} />
        </section>
      )}
    </main>
  );
}
