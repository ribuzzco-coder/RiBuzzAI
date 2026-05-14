"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PHASE_LABELS: Record<string, string> = {
  queued: "Preparando tu lectura...",
  fetching_data: "Organizando tus respuestas",
  calculating_metrics: "Poniendo tus números en orden",
  synthesizing: "Encontrando los patrones importantes",
  scoring_parallel: "Leyendo las señales comerciales",
  scoring_pmf: "Midiendo el encaje con el mercado",
  scoring_monetizacion: "Revisando cómo captura valor tu negocio",
  scoring_adquisicion: "Observando tus canales de crecimiento",
  scoring_operaciones: "Ordenando la operación y sus prioridades",
  selecting_top_fugas: "Detectando las fugas más urgentes",
  writing_report: "Armando una lectura clara para ti",
  designing_playbook: "Preparando próximos pasos",
  classifying_lead: "Cerrando recomendaciones",
  quality_review: "Revisando que todo tenga sentido",
  persisting: "Guardando tu diagnóstico",
  done: "Listo"
};

const WAITING_NOTES = [
  "Estamos convirtiendo tus respuestas en una lectura clara y accionable.",
  "Ya casi: estamos separando ruido de señales importantes.",
  "Buen momento para respirar. El informe está tomando forma.",
  "Estamos afinando prioridades para que el resultado sea útil, no solo bonito."
];

function ProcessingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const diagnosticId = params.get("d");

  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<"queued" | "running" | "completed" | "failed" | "cancelled">("queued");
  const [phase, setPhase] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. Disparar el procesamiento
  useEffect(() => {
    if (!diagnosticId) return;
    (async () => {
      try {
        const res = await fetch("/api/diagnostic/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ diagnostic_id: diagnosticId })
        });
        const body = await res.json();
        if (!res.ok || !body.job_id) {
          throw new Error(body.error ?? body.hint ?? "No se pudo iniciar el procesamiento");
        }
        setJobId(body.job_id);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [diagnosticId]);

  // 2. Polling al job
  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    const start = Date.now();
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);

    async function poll() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("polling_failed");
        const data = await res.json();
        if (stopped) return;
        setStatus(data.status);
        setPhase(data.current_phase);
        setProgress(data.progress_pct ?? 0);
        if (data.status === "completed") {
          clearInterval(tick);
          stopped = true;
          router.push(`/results?d=${diagnosticId}`);
          return;
        }
        if (data.status === "failed") {
          clearInterval(tick);
          stopped = true;
          setError(data.error_message ?? "El procesamiento falló");
          return;
        }
      } catch (e) {
        // No matar el poll por un error intermitente; reintenta en el próximo tick
      }
      if (!stopped) pollTimer.current = setTimeout(poll, 2000);
    }
    poll();

    return () => {
      stopped = true;
      clearInterval(tick);
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  if (error) {
    return (
      <main className="ribuzz-shell mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="text-xl font-semibold text-ribuzz-primary">
          No pudimos generar tu diagnóstico
        </h1>
        <p className="mt-3 text-sm text-ribuzz-muted">{error}</p>
        <p className="mt-3 text-sm text-ribuzz-muted">
          Tus respuestas están guardadas. Puedes reintentar más tarde.
        </p>
        <button
          onClick={() => location.reload()}
          className="mt-6 rounded-full bg-gradient-to-br from-[#211326] to-[#4F1263] px-5 py-3 font-bold text-white"
        >
          Reintentar
        </button>
      </main>
    );
  }

  const phaseLabel = (phase && PHASE_LABELS[phase]) ?? "Iniciando...";
  const waitingNote = WAITING_NOTES[Math.floor(elapsed / 8) % WAITING_NOTES.length];

  return (
    <main className="ribuzz-shell mx-auto flex min-h-screen max-w-md items-center px-6 py-16 text-center">
      <section className="glow-card w-full rounded-[2rem] p-8">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-ribuzz-accent border-t-transparent" />
      <h1 className="mt-6 text-xl font-semibold text-ribuzz-primary">
        Estamos ordenando tu diagnóstico
      </h1>
      <p className="mt-3 text-sm text-ribuzz-muted">
        Danos un momento mientras transformamos tus respuestas en una lectura práctica para tu negocio.
      </p>
      <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-ribuzz-primary">
        {waitingNote}
      </p>

      {/* Barra de progreso */}
      <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-black/35">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#3B214E] to-ribuzz-accent shadow-[0_0_12px_rgba(230,37,255,0.18)] transition-all duration-700"
          style={{ width: `${Math.max(progress, 3)}%` }}
        />
      </div>

      <p className="mt-3 text-sm font-medium text-ribuzz-primary">{phaseLabel}</p>
      <p className="mt-1 text-xs text-ribuzz-muted">
        {progress}% · {elapsed}s
      </p>

      {elapsed > 90 && status === "running" && (
        <p className="mt-4 text-sm text-amber-600">
          Está tomando más de lo habitual, pero seguimos trabajando en tu informe. Espera unos segundos más.
        </p>
      )}
      </section>
    </main>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-ribuzz-muted">Cargando...</p>}>
      <ProcessingInner />
    </Suspense>
  );
}
