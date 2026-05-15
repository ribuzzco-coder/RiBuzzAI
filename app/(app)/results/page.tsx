import { redirect } from "next/navigation";
import Link from "next/link";
import { createServer, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { ScoreCard } from "@/components/results/ScoreCard";
import { FugasCard } from "@/components/results/FugasCard";
import { PlaybookAccordion } from "@/components/results/PlaybookAccordion";
import { FugaSelector } from "@/components/results/FugaSelector";
import { ShareButton } from "@/components/results/ShareButton";
import { formatCOP } from "@/lib/utils";
import type {
  TopFuga,
  ScorerVariable,
  PlaybookAccion,
  CalculatedMetrics,
  VariableScore
} from "@/lib/types";

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
  if (!hasSupabaseServerEnv()) redirect("/login");

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
        <Link href="/profile" className="mt-4 inline-block text-ribuzz-pink">
          Volver al perfil
        </Link>
      </main>
    );
  }

  const fugas = (score.top_fugas ?? []) as TopFuga[];
  const metrics = (score.calculated_metrics ?? {}) as Partial<CalculatedMetrics>;
  const acciones = (playbook.acciones ?? []) as PlaybookAccion[];

  const rawAi = (score.raw_ai_response ?? {}) as any;
  const rawDetailsSource =
    rawAi.scores_detail ??
    rawAi.scores ??
    rawAi.score_detail ??
    rawAi.variables ??
    {};
  const rawDetails = Array.isArray(rawDetailsSource)
    ? Object.fromEntries(rawDetailsSource.map((item: any) => [item.variable, item]))
    : rawDetailsSource;
  const ticketMetric = Number(
    metrics.ticket_medio ??
      rawAi.metrics?.ticket_medio ??
      rawAi.calculated_metrics?.ticket_medio ??
      rawAi.metricas?.ticket_medio ??
      0
  );
  const ticketDetail =
    rawDetails.ticket_medio ??
    rawAi.ticket_medio ??
    rawAi.ticketMedio ??
    rawAi.ticket_promedio;
  const ticketDetailObject =
    ticketDetail && typeof ticketDetail === "object"
      ? ticketDetail
      : ticketMetric > 0 || ticketDetail
        ? {
            score: Number((score as any).ticket_medio ?? ticketDetail?.score ?? 0),
            estado: "Dato recibido",
            confianza: "alta",
            evidencia: `Ticket medio declarado o calculado: ${formatCOP(ticketMetric || Number(ticketDetail) || 0)}`,
            diagnostico: `${company?.name ?? "Tu empresa"} reporta un ticket medio de ${formatCOP(ticketMetric || Number(ticketDetail) || 0)}.`,
            impacto: "Este dato permite evaluar margen, CAC y capacidad de reinversion con mayor precision.",
            brecha: "Cruzar este ticket con costos de adquisicion y recurrencia para medir rentabilidad real.",
            recomendacion: "Manten este valor actualizado cada mes y comparalo contra CAC y recompra."
          }
        : undefined;
  const scoresDetail = {
    ...rawDetails,
    ticket_medio: ticketDetailObject
  } as Record<ScorerVariable, VariableScore>;

  return (
    <main className="ribuzz-shell mx-auto max-w-4xl px-6 py-10">

      {/* ── Header ── */}
      <header className="mb-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/profile" className="text-sm font-semibold text-ribuzz-pink hover:text-ribuzz-primary">
            Todos mis diagnósticos
          </Link>
          <Link href="/diagnostic?new=1" className="text-sm text-ribuzz-muted hover:text-ribuzz-primary">
            Nuevo diagnóstico
          </Link>
        </div>
        <p className="text-xs uppercase tracking-widest text-ribuzz-pink">Diagnóstico RiBuzz</p>
        <h1 className="mt-1 text-3xl font-bold">{company?.name ?? "Tu empresa"}</h1>

        {/* ── Score global ── */}
        <div className="glow-card mt-6 rounded-3xl p-6">
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
        </div>
      </header>

      {/* ── Reconocimiento ── */}
      {report.reconocimiento && (
        <section className="mb-8 rounded-3xl border border-ribuzz-accent/18 bg-white/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
          <p className="text-xs uppercase tracking-widest text-ribuzz-pink">
            Para {company?.name ?? "ti"}
          </p>
          <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ribuzz-primary">
            {report.reconocimiento}
          </p>
        </section>
      )}

      {/* ── Insight hero: lectura principal + fractura silenciosa ── */}
      <section className="mb-10">
        {/* Lectura principal destacada */}
        <div className="mb-6 rounded-3xl border border-ribuzz-accent/20 bg-gradient-to-br from-ribuzz-accent/[0.05] to-transparent p-7">
          <p className="text-xs uppercase tracking-widest text-ribuzz-accent mb-3">La lectura de tu negocio</p>
          <p className="text-xl font-semibold leading-relaxed text-ribuzz-primary">{report.lectura_principal}</p>
        </div>
        {/* Fractura silenciosa */}
        {report.fractura_silenciosa && (
          <div className="rounded-3xl border border-yellow-500/25 bg-yellow-500/[0.06] p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-3">⚡ La fractura silenciosa</p>
            <p className="text-sm leading-relaxed text-ribuzz-primary">{report.fractura_silenciosa}</p>
          </div>
        )}
      </section>

      {/* ── Top 3 fugas ── */}
      <section className="mb-10">
        <FugasCard fugas={fugas} />
      </section>

      {/* ── Siguiente paso standalone ── */}
      {report.siguiente_paso && (
        <section className="mb-8 rounded-3xl border border-ribuzz-cyan/30 bg-gradient-to-br from-ribuzz-cyan/[0.06] to-transparent p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⏱</span>
            <p className="text-sm font-bold uppercase tracking-widest text-ribuzz-cyan">Tu siguiente paso — próximos 7 días</p>
          </div>
          <p className="text-sm leading-relaxed text-ribuzz-primary whitespace-pre-line">{report.siguiente_paso}</p>
        </section>
      )}

      {/* ── FugaSelector ── */}
      {fugas.length > 0 && (
        <FugaSelector
          fugas={fugas}
          acciones={acciones}
          mensajeBase={playbook.mensaje_base ?? ""}
          companyName={company?.name ?? "tu empresa"}
          canal={playbook.canal_sugerido ?? "WhatsApp"}
        />
      )}

      {/* ── Situación actual (solo el texto, sin fractura ni siguiente_paso) ── */}
      <section className="glow-card mb-10 rounded-3xl p-6">
        <h2 className="text-lg font-semibold">Situación actual</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ribuzz-primary">
          {report.situacion_actual}
        </p>
      </section>

      {/* ── 14 variables (expandibles) ── */}
      <section className="mb-10">
        <h2 className="mb-1 text-lg font-semibold">Detalle de las 14 variables</h2>
        <p className="mb-4 text-xs text-ribuzz-muted">
          Toca cualquier variable para ver evidencia, diagnóstico, impacto y recomendación específica.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {VARIABLES_ORDER.map((v) => (
            <ScoreCard
              key={v}
              variable={v}
              score={(score as any)[v] ?? 0}
              detail={scoresDetail[v]}
              metricValue={v === "ticket_medio" && ticketMetric > 0 ? formatCOP(ticketMetric) : undefined}
            />
          ))}
        </div>
      </section>

      {/* ── Playbook ── */}
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

      {/* ── Conexión con el sueño (v2) ── */}
      {report.conexion_sueno && (
        <section className="mb-10 rounded-3xl border border-ribuzz-violet/24 bg-white/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
          <p className="text-xs uppercase tracking-widest text-ribuzz-pink">
            Tu visión
          </p>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ribuzz-primary">
            {report.conexion_sueno}
          </p>
        </section>
      )}

      {/* ── CTA ── */}
      <div className="glow-card rounded-3xl p-6">
        <h2 className="text-lg font-semibold">¿Quieres profundizar con RiBuzz?</h2>
        <p className="mt-2 text-sm text-white/80">
          Agenda 30 minutos para revisar tu diagnóstico contigo y definir próximos pasos.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ShareButton
            companyName={company?.name ?? "Mi empresa"}
            scoreGlobal={Number(score.score_global ?? 0)}
            lecturaPrincipal={report.lectura_principal}
            siguientePaso={report.siguiente_paso}
            diagnosticId={diagnosticId}
          />
          <a
            href={`https://wa.me/573332541346?text=${encodeURIComponent(
              `Hola, quiero revisar mi diagnóstico de ${company?.name ?? ""}.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center rounded-full border border-ribuzz-accent/28 bg-gradient-to-br from-[#211326] to-[#3A2148] px-5 font-bold text-white shadow-[0_0_24px_rgba(230,37,255,0.14)] transition hover:border-ribuzz-accent/45"
          >
            Hablar con RiBuzz
          </a>
        </div>
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
