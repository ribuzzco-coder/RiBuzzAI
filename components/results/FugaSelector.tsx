"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VARIABLE_LABELS } from "@/lib/utils";
import type { TopFuga, PlaybookAccion } from "@/lib/types";

interface Props {
  fugas: TopFuga[];
  acciones: PlaybookAccion[];
  mensajeBase: string;
  companyName: string;
  canal: string;
}

export function FugaSelector({ fugas, acciones, mensajeBase, companyName, canal }: Props) {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!fugas.length) return null;

  const fuga = fugas[selected];
  const accion =
    acciones.find((a) => a.prioridad === fuga.prioridad) ?? acciones[selected] ?? acciones[0];

  function handleCopy() {
    navigator.clipboard.writeText(mensajeBase).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="glow-card mb-8 rounded-3xl p-6">
      <h2 className="font-display text-lg font-semibold text-ribuzz-primary">
        ¿Por cuál empezamos?
      </h2>
      <p className="mt-1 text-sm text-ribuzz-muted">
        Elige la fuga que quieres atacar esta semana.
      </p>

      {/* Selector de fugas */}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {fugas.map((f, i) => (
          <button
            key={f.variable}
            onClick={() => setSelected(i)}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
              selected === i
                ? "border-ribuzz-accent bg-ribuzz-accent/10 text-ribuzz-primary"
                : "border-white/10 bg-white/[0.03] text-ribuzz-muted hover:border-ribuzz-accent/40 hover:text-ribuzz-primary"
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                selected === i
                  ? "border-ribuzz-accent bg-ribuzz-accent/20 text-ribuzz-pink shadow-[0_0_12px_rgba(230,37,255,0.2)]"
                  : "border-ribuzz-accent/25 bg-ribuzz-accent/[0.06] text-ribuzz-pink"
              )}
            >
              {f.prioridad}
            </span>
            <span className="leading-tight">
              {VARIABLE_LABELS[f.variable] ?? f.variable}
            </span>
          </button>
        ))}
      </div>

      {/* Panel de detalle */}
      {fuga && (
        <div className="mt-5 space-y-4">
          {/* Diagnóstico */}
          <div className="border-l-2 border-ribuzz-accent pl-4">
            <p className="text-sm italic leading-relaxed text-ribuzz-muted">
              {fuga.diagnostico}
            </p>
          </div>

          {/* Primer paso */}
          {accion && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-ribuzz-pink mb-2">
                Tu primer paso esta semana:
              </p>
              <p className="text-sm leading-relaxed text-ribuzz-primary">
                {accion.como}
              </p>
            </div>
          )}

          {/* Mensaje listo */}
          {mensajeBase && (
            <div className="rounded-2xl border border-ribuzz-cyan/30 bg-black/30 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-ribuzz-cyan mb-2">
                Mensaje listo para enviar:
              </p>
              <p className="text-xs leading-relaxed text-ribuzz-muted whitespace-pre-line">
                {mensajeBase}
              </p>
              <button
                onClick={handleCopy}
                className="mt-3 inline-flex h-8 items-center rounded-full border border-ribuzz-cyan/40 bg-ribuzz-cyan/10 px-4 text-xs font-semibold text-ribuzz-cyan transition hover:bg-ribuzz-cyan/20"
              >
                {copied ? "✓ Copiado" : "Copiar mensaje"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
