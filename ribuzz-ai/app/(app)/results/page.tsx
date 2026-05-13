import { redirect } from "next/navigation";
import Link from "next/link";
import { createServer } from "@/lib/supabase/server";
import { ScoreCard } from "@/components/results/ScoreCard";
import { FugasCard } from "@/components/results/FugasCard";
import { PlaybookAccordion } from "@/components/results/PlaybookAccordion";
import { formatCOP } from "@/lib/utils";
import type { TopFuga, ScorerVariable, PlaybookAccion, CalculatedMetrics } from "@/lib/types";

const VARIABLES_ORDER: ScorerVariable[] = [
  "problema", "solucion", "icp", "cliente_actual", "oferta", "ecuacion_valor",
  "ticket_medio", "recurrencia", "canal_adquisicion", "cac", "conversion",
  "seguimiento", "escalamiento", "capacidad_ejecucion"
];

export default async function ResultsPage({
  searchParams
}: {
  searchParams: { d?: string };
}) {
  const supabase = createServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const diagnosticId = searchParams.d;
  if (!diagnosticId) redirect("/profile");

  const [scoreRes, reportRes, playbookRes, diagRes] = await Promise.all([
    supabase.from("scores").select("*").eq("diagnostic_id", diagnosticId).maybeSingle(),
    supabase.from("reports").select("*").eq("diagnostic_id", diagnosticId).maybeSingle(),
    supabase.from("playbooks").select("*").eq("diagnostic_id", diagnosticId).maybeSingle(),
    supabase.from("diagnostics").select("*, companies(*)").eq("id", diagnosticId).maybeSingle()
  ]);

  const score = scoreRes.data;
  const report = reportRes.data;
  const playbook = playbookRes.data;
  const company = diagRes.data?.companies as any;

  if (!score || !report || !playbook) {
    return (
      <main className="ribuzz-shell mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-xl font-semibold">Diagnóstico aún no disponible</h1>
        <p className="mt-2 text-ribuzz-muted">
          Si acabas de terminar las preguntas, el procesamiento puede tomar hasta un minuto.
        </p>
        <Link href="/profile" className="mt-4 inline-block text-ribuzz-accent">
          Volver al perfil
        </Link>
      </main>
    );
  }

  const fugas = (score.top_fugas ?? []) as TopFuga[];
  const metrics = (score.calculated_metrics ?? {}) as Partial<CalculatedMetrics>;
  const acciones = (playbook.acciones ?? []) as PlaybookAccion[];

  return (
    <main className="ribuzz-shell mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-ribuzz-accent">Diagnóstico RiBuzz</p>
        <h1 className="mt-1 text-3xl font-bold">{company?.name ?? "Tu empresa"}</h1>
        <p className="mt-2 text-ribuzz-muted">{report.lectura_principal}</p>
      </header>

      {/* Score global */}
      <section className="glow-card mb-8 rounded-3xl p-6">
        <p className="text-sm text-ribuzz-muted">Score global</p>
        <p className="text-4xl font-bold text-ribuzz-primary">
          {Number(score.score_global ?? 0).toFixed(1)}
          <span className="text-base font-normal text-ribuzz-muted"> / 5</span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Stat label="Ticket medio" value={metrics.ticket_medio ? formatCOP(metrics.ticket_medio) : "—"} />
          <Stat label="CAC" value={metrics.cac ? formatCOP(metrics.cac) : "—"} />
          <Stat label="LTV est." value={metrics.ltv ? formatCOP(metrics.ltv) : "—"} />
          <Stat label="Salud comercial" value={metrics.salud_comercial ? `${metrics.salud_comercial}/100` : "—"} />
        </div>
      </section>

      {/* Top 3 fugas */}
      <section className="mb-10">
        <FugasCard fugas={fugas} />
      </section>

      {/* Reporte */}
      <section className="glow-card mb-10 rounded-3xl p-6">
        <h2 className="text-lg font-semibold">Situación actual</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ribuzz-primary">
          {report.situacion_actual}
        </p>
        <div className="mt-5 rounded-2xl border border-ribuzz-accent/25 bg-ribuzz-accent/[0.08] p-4 text-sm">
          <p className="font-semibold text-ribuzz-cyan">Siguiente paso (7 días):</p>
          <p className="mt-1 text-ribuzz-muted">{report.siguiente_paso}</p>
        </div>
      </section>

      {/* Detalle 14 variables */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Detalle de las 14 variables</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {VARIABLES_ORDER.map((v) => (
            <ScoreCard key={v} variable={v} score={(score as any)[v] ?? 0} />
          ))}
        </div>
      </section>

      {/* Playbook */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold">Tu playbook</h2>
        <PlaybookAccordion acciones={acciones} />

        {playbook.plan_30_dias && (
          <div className="glow-card mt-6 rounded-3xl p-5">
            <h3 className="font-semibold">Plan de 4 semanas</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {["semana_1", "semana_2", "semana_3", "semana_4"].map((k, i) => (
                <li key={k}>
                  <strong>Semana {i + 1}:</strong>{" "}
                  {(playbook.plan_30_dias as any)[k] ?? "—"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* CTA */}
      <div className="glow-card rounded-3xl p-6">
        <h2 className="text-lg font-semibold">¿Quieres profundizar con RiBuzz?</h2>
        <p className="mt-2 text-sm text-white/80">
          Agenda 30 minutos para revisar tu diagnóstico contigo y definir próximos pasos.
        </p>
        <a
          href={`https://wa.me/573000000000?text=${encodeURIComponent(
            `Hola, quiero revisar mi diagnóstico de ${company?.name ?? ""}.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-gradient-to-br from-ribuzz-accent to-ribuzz-violet px-5 font-bold text-white shadow-[0_0_30px_rgba(230,37,255,0.36)]"
        >
          Hablar con RiBuzz
        </a>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ribuzz-muted">{label}</p>
      <p className="text-base font-semibold text-ribuzz-primary">{value}</p>
    </div>
  );
}
