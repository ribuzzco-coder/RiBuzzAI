"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QUESTIONS } from "@/lib/questions";
import { QuestionCard } from "@/components/diagnostic/QuestionCard";
import { ProgressBar } from "@/components/diagnostic/ProgressBar";

// ── Micro-reflexiones entre bloques ─────────────────────────────────────────
// firstQuestion del bloque siguiente → { titulo, mensaje, emoji }
const BLOCK_REFLECTIONS: Record<number, { titulo: string; mensaje: string; emoji: string }> = {
  5: {
    emoji: "✓",
    titulo: "Contexto registrado",
    mensaje:
      "Ahora vamos a entender en qué punto está tu negocio hoy — sin filtros, sin embellecer. Sé directo: eso es lo que nos permite ayudarte de verdad."
  },
  8: {
    emoji: "✓",
    titulo: "Momento comercial claro",
    mensaje:
      "Siguiente: lo que vendes y cómo lo presentas. Aquí es donde la mayoría de negocios tiene su mayor oportunidad de mejora."
  },
  13: {
    emoji: "✓",
    titulo: "Tu oferta, registrada",
    mensaje:
      "Ahora algo crítico: ¿quién es tu cliente real? No el que quieres tener, sino el que ya te compra. Esa distinción cambia todo."
  },
  18: {
    emoji: "✓",
    titulo: "Perfil de cliente capturado",
    mensaje:
      "Cuéntanos sobre ventas recientes — lo que cerró y lo que se escapó. Eso nos dice más que cualquier plan de negocios."
  },
  22: {
    emoji: "✓",
    titulo: "Muy útil",
    mensaje:
      "Ahora los números: canales, interesados y ventas del último mes. Si no los tienes exactos, un estimado sirve — lo importante es la tendencia."
  },
  27: {
    emoji: "✓",
    titulo: "Números registrados",
    mensaje:
      "Siguiente: cómo organizas lo que pasa en tu negocio. Esto nos dice si lo que está funcionando es repetible o depende de ti al 100%."
  },
  32: {
    emoji: "✓",
    titulo: "Organización evaluada",
    mensaje:
      "Casi listo. Queremos entender si tus clientes vuelven y si te recomiendan — eso define el techo real de tu crecimiento."
  },
  36: {
    emoji: "✓",
    titulo: "Excelente",
    mensaje:
      "Última sección. Aquí defines hacia dónde quieres ir y qué te está frenando. Es lo que más pesa en tu diagnóstico."
  }
};

type Mode = "question" | "reflection" | "confirmation";

export function DiagnosticClient() {
  const router = useRouter();
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { answer: string; isUnknown: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("question");
  const [pendingIndex, setPendingIndex] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: companies } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (!companies || companies.length === 0) {
        router.push("/register");
        return;
      }
      const companyId = companies[0].id;

      const params = new URLSearchParams(window.location.search);
      const forceNew = params.get("new") === "1";
      const requestedDiagnosticId = params.get("d");
      if (requestedDiagnosticId && !forceNew) {
        const { data: requested } = await supabase
          .from("diagnostics")
          .select("id, current_question, status, company_id")
          .eq("id", requestedDiagnosticId)
          .eq("company_id", companyId)
          .maybeSingle();

        if (requested?.status === "completed") {
          router.push(`/results?d=${requested.id}`);
          return;
        }

        if (requested) {
          setDiagnosticId(requested.id);
          setCurrentIndex(Math.max(0, (requested.current_question ?? 1) - 1));
          setLoading(false);
          return;
        }
      }

      const { data: existing } = forceNew
        ? { data: null }
        : await supabase
            .from("diagnostics")
            .select("id, current_question, status")
            .eq("company_id", companyId)
            .eq("status", "in_progress")
            .order("created_at", { ascending: false })
            .limit(1);

      let id: string;
      let q = 1;
      if (existing && existing.length > 0) {
        id = existing[0].id;
        q = existing[0].current_question;
      } else {
        const { data: created } = await supabase
          .from("diagnostics")
          .insert({ company_id: companyId, current_question: 1 })
          .select("id")
          .single();
        id = created!.id;
      }
      setDiagnosticId(id);
      setCurrentIndex(Math.max(0, q - 1));
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <main className="ribuzz-shell min-h-screen px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <DiagnosticHeader />
        </div>
        <div className="grid min-h-[70vh] place-items-center">
          <p className="glow-card rounded-3xl px-8 py-6 text-center text-ribuzz-muted">
            Cargando diagnóstico...
          </p>
        </div>
      </main>
    );
  }

  // ── Pantalla de confirmación ─────────────────────────────────────────────
  if (mode === "confirmation") {
    const companyName = answers[2]?.answer ?? "";
    const description = answers[4]?.answer ?? "";
    const objective = answers[36]?.answer ?? answers[37]?.answer ?? "";

    return (
      <main className="ribuzz-shell min-h-screen px-6 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center">
          <DiagnosticHeader />
          <ConfirmationScreen
            companyName={companyName}
            description={description}
            objective={objective}
            totalAnswers={Object.keys(answers).length}
            submitting={submitting}
            onConfirm={async () => {
              setSubmitting(true);
              router.push(`/processing?d=${diagnosticId}`);
            }}
            onBack={() => {
              setCurrentIndex(QUESTIONS.length - 1);
              setMode("question");
            }}
          />
        </div>
      </main>
    );
  }

  // ── Micro-reflexión entre bloques ────────────────────────────────────────
  if (mode === "reflection") {
    const reflection = BLOCK_REFLECTIONS[QUESTIONS[pendingIndex]?.numero];
    const nextBlock = QUESTIONS[pendingIndex]?.seccion ?? "";
    return (
      <main className="ribuzz-shell min-h-screen px-6 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center">
          <DiagnosticHeader />
          <BlockReflectionCard
            emoji={reflection?.emoji ?? "✓"}
            titulo={reflection?.titulo ?? "Bloque completado"}
            mensaje={reflection?.mensaje ?? "Continuemos con el siguiente bloque."}
            nextBlock={nextBlock}
            currentQ={currentIndex + 1}
            totalQ={QUESTIONS.length}
            onContinue={() => {
              setCurrentIndex(pendingIndex);
              setMode("question");
            }}
          />
        </div>
      </main>
    );
  }

  // ── Pregunta activa ──────────────────────────────────────────────────────
  const pregunta = QUESTIONS[currentIndex];
  const savedAnswer = answers[pregunta.numero];

  function handleBack() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  async function handleSubmit({ answer, isUnknown }: { answer: string; isUnknown: boolean }) {
    if (!diagnosticId) return;
    setAnswers((current) => ({
      ...current,
      [pregunta.numero]: { answer, isUnknown }
    }));
    await fetch("/api/diagnostic/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        diagnostic_id: diagnosticId,
        question_number: pregunta.numero,
        variable_bd: pregunta.variables.join(","),
        question_text: pregunta.texto,
        answer_text: answer,
        is_unknown: isUnknown,
        is_fused: pregunta.isFused ?? false
      })
    });

    const next = currentIndex + 1;

    // ¿Terminó el formulario?
    if (next >= QUESTIONS.length) {
      setMode("confirmation");
      return;
    }

    // ¿Cambio de bloque? → mostrar micro-reflexión
    const nextPregunta = QUESTIONS[next];
    const hasReflection = nextPregunta.numero in BLOCK_REFLECTIONS;
    if (hasReflection) {
      setPendingIndex(next);
      setMode("reflection");
      return;
    }

    setCurrentIndex(next);
  }

  return (
    <main className="ribuzz-shell min-h-screen px-6 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center">
        <DiagnosticHeader />
        <div className="mb-8">
          <ProgressBar
            current={pregunta.numero}
            total={QUESTIONS.length}
            seccion={pregunta.seccion}
          />
        </div>
        <QuestionCard
          pregunta={pregunta}
          onSubmit={handleSubmit}
          onBack={handleBack}
          canGoBack={currentIndex > 0}
          defaultValue={savedAnswer?.isUnknown ? "" : savedAnswer?.answer ?? ""}
        />
      </div>
    </main>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function DiagnosticHeader() {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <Link href="/profile" className="text-sm font-semibold text-ribuzz-pink hover:text-ribuzz-primary">
        Mis diagnósticos
      </Link>
      <Link href="/diagnostic?new=1" className="text-sm text-ribuzz-muted hover:text-ribuzz-primary">
        Nuevo diagnóstico
      </Link>
    </div>
  );
}

function BlockReflectionCard({
  emoji,
  titulo,
  mensaje,
  nextBlock,
  currentQ,
  totalQ,
  onContinue
}: {
  emoji: string;
  titulo: string;
  mensaje: string;
  nextBlock: string;
  currentQ: number;
  totalQ: number;
  onContinue: () => void;
}) {
  const pct = Math.round((currentQ / totalQ) * 100);
  return (
    <div className="glow-card rounded-3xl p-8 text-center">
      {/* Badge de progreso */}
      <div className="mb-6 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-ribuzz-accent/30 bg-ribuzz-accent/10 px-4 py-1.5 text-xs font-semibold text-ribuzz-pink">
          <span className="h-1.5 w-1.5 rounded-full bg-ribuzz-pink" />
          Bloque {nextBlock} · {pct}% completado
        </span>
      </div>

      {/* Ícono animado */}
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-ribuzz-accent/25 bg-ribuzz-accent/[0.08] text-2xl shadow-[0_0_24px_rgba(230,37,255,0.15)]">
        {emoji}
      </div>

      <h2 className="font-display text-2xl font-bold text-ribuzz-primary mb-3">
        {titulo}
      </h2>
      <p className="text-sm leading-relaxed text-ribuzz-muted max-w-md mx-auto mb-8">
        {mensaje}
      </p>

      <button
        onClick={onContinue}
        className="inline-flex items-center gap-2 rounded-full bg-ribuzz-accent px-8 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(230,37,255,0.3)] transition hover:brightness-110 active:scale-95"
      >
        Continuar →
      </button>
    </div>
  );
}

function ConfirmationScreen({
  companyName,
  description,
  objective,
  totalAnswers,
  submitting,
  onConfirm,
  onBack
}: {
  companyName: string;
  description: string;
  objective: string;
  totalAnswers: number;
  submitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glow-card rounded-3xl p-7 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-ribuzz-cyan/30 bg-ribuzz-cyan/[0.08] text-2xl shadow-[0_0_24px_rgba(0,229,255,0.1)]">
          🎯
        </div>
        <h2 className="font-display text-2xl font-bold text-ribuzz-primary mb-2">
          Todo listo, {companyName || "fundador"}
        </h2>
        <p className="text-sm text-ribuzz-muted max-w-sm mx-auto">
          Respondiste {totalAnswers} de {QUESTIONS.length} preguntas. Revisá un momento y cuando estés listo, analizamos tu negocio.
        </p>
      </div>

      {/* Resumen */}
      <div className="glow-card rounded-3xl p-6 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-ribuzz-pink mb-4">
          Lo que nos dijiste
        </p>

        {description && (
          <SummaryRow
            label="Tu negocio"
            value={description.length > 120 ? description.slice(0, 120) + "…" : description}
          />
        )}

        {objective && (
          <SummaryRow
            label="Tu objetivo"
            value={objective.length > 120 ? objective.slice(0, 120) + "…" : objective}
          />
        )}

        <SummaryRow
          label="Preguntas respondidas"
          value={`${totalAnswers} de ${QUESTIONS.length}`}
        />
      </div>

      {/* Aviso */}
      <div className="rounded-2xl border border-ribuzz-cyan/20 bg-ribuzz-cyan/[0.04] px-5 py-4">
        <p className="text-xs leading-relaxed text-ribuzz-muted">
          <span className="font-semibold text-ribuzz-cyan">¿Qué pasa ahora?</span>{" "}
          Nuestros agentes de IA van a analizar tus respuestas en profundidad. El proceso toma entre 30 y 60 segundos. Al terminar, recibirás tu diagnóstico completo con las fugas comerciales de tu negocio y un plan de acción concreto.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          onClick={onBack}
          disabled={submitting}
          className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-ribuzz-muted transition hover:border-white/20 hover:text-ribuzz-primary disabled:opacity-40"
        >
          ← Revisar respuestas
        </button>
        <button
          onClick={onConfirm}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ribuzz-accent px-8 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(230,37,255,0.3)] transition hover:brightness-110 active:scale-95 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Iniciando análisis…
            </>
          ) : (
            "Analizar mi negocio →"
          )}
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-ribuzz-accent/30 pl-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ribuzz-pink mb-0.5">
        {label}
      </p>
      <p className="text-sm text-ribuzz-muted leading-relaxed">{value}</p>
    </div>
  );
}
