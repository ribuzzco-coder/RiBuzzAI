"use client";

import { useState } from "react";
import type { Pregunta } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { AnswerInput } from "./AnswerInput";

interface Props {
  pregunta: Pregunta;
  onSubmit: (payload: { answer: string; isUnknown: boolean }) => Promise<void> | void;
  defaultValue?: string;
}

export function QuestionCard({ pregunta, onSubmit, defaultValue = "" }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [submitting, setSubmitting] = useState(false);

  async function handle(unknown: boolean) {
    setSubmitting(true);
    try {
      await onSubmit({ answer: unknown ? "" : value, isUnknown: unknown });
      setValue("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glow-card animate-rise rounded-[2rem] p-6 shadow-2xl sm:p-8">
      {pregunta.isFused && (
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-ribuzz-pink">
          Dos preguntas en una
        </p>
      )}
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ribuzz-pink">
        Diagnóstico comercial
      </p>
      <h2 className="font-display text-2xl font-semibold leading-tight text-ribuzz-primary sm:text-3xl">
        {pregunta.texto}
      </h2>

      <div className="mt-7">
        <AnswerInput pregunta={pregunta} value={value} onChange={setValue} disabled={submitting} />
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* allowUnknown defaults to true — solo ocultar si está explícitamente en false */}
        {pregunta.allowUnknown !== false && (
          <Button
            variant="ghost"
            onClick={() => handle(true)}
            disabled={submitting}
          >
            No sé
          </Button>
        )}
        <Button
          onClick={() => handle(false)}
          disabled={submitting || value.trim().length === 0}
          loading={submitting}
          className={pregunta.allowUnknown === false ? "ml-auto" : ""}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
