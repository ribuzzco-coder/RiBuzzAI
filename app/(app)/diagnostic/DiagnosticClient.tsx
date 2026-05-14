"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QUESTIONS } from "@/lib/questions";
import { QuestionCard } from "@/components/diagnostic/QuestionCard";
import { ProgressBar } from "@/components/diagnostic/ProgressBar";

export function DiagnosticClient() {
  const router = useRouter();
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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

      const forceNew = new URLSearchParams(window.location.search).get("new") === "1";
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

  if (currentIndex >= QUESTIONS.length) {
    router.push(`/processing?d=${diagnosticId}`);
    return null;
  }

  const pregunta = QUESTIONS[currentIndex];

  async function handleSubmit({ answer, isUnknown }: { answer: string; isUnknown: boolean }) {
    if (!diagnosticId) return;
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
    setCurrentIndex(next);

    if (next >= QUESTIONS.length) {
      router.push(`/processing?d=${diagnosticId}`);
    }
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
        <QuestionCard pregunta={pregunta} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}

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
