"use client";

import { useEffect, useState } from "react";
import type { Pregunta } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { AnswerInput } from "./AnswerInput";

interface Props {
  pregunta: Pregunta;
  onSubmit: (payload: { answer: string; isUnknown: boolean }) => Promise<void> | void;
  onBack?: () => void;
  canGoBack?: boolean;
  defaultValue?: string;
}

export function QuestionCard({
  pregunta,
  onSubmit,
  onBack,
  canGoBack = false,
  defaultValue = ""
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, pregunta.numero]);

  async function handle(unknown: boolean) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ answer: unknown ? "" : value, isUnknown: unknown });
      setValue("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || event.shiftKey || submitting || value.trim().length === 0) {
      return;
    }

    const target = event.target as HTMLElement;
    const isTextarea = target.tagName === "TEXTAREA";
    const isButton = target.closest("button");

    if (isButton || (isTextarea && !event.ctrlKey && !event.metaKey)) {
      return;
    }

    event.preventDefault();
    void handle(false);
  }

  return (
    <div
      className="glow-card animate-rise rounded-[2rem] p-6 shadow-2xl sm:p-8"
      onKeyDown={handleKeyDown}
    >
      {pregunta.isFused && (
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-ribuzz-pink">
          Dos preguntas en una
        </p>
      )}
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ribuzz-pink">
        Diagnostico comercial
      </p>
      <h2 className="font-display text-2xl font-semibold leading-tight text-ribuzz-primary sm:text-3xl">
        {pregunta.texto}
      </h2>

      <div className="mt-7">
        <AnswerInput pregunta={pregunta} value={value} onChange={setValue} disabled={submitting} />
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={!canGoBack || submitting}
          >
            Pregunta anterior
          </Button>
          {pregunta.allowUnknown !== false && (
            <Button
              variant="ghost"
              onClick={() => handle(true)}
              disabled={submitting}
            >
              No se
            </Button>
          )}
        </div>
        <Button
          onClick={() => handle(false)}
          disabled={submitting || value.trim().length === 0}
          loading={submitting}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
