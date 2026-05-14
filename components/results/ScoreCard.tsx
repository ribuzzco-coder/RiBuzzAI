"use client";

import { useState } from "react";
import { cn, scoreColor, scoreEstado, VARIABLE_LABELS } from "@/lib/utils";
import type { VariableScore } from "@/lib/types";

interface Props {
  variable: string;
  score: number;
  detail?: VariableScore;
  metricValue?: string;
}

export function ScoreCard({ variable, score, detail, metricValue }: Props) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!detail;

  return (
    <div className="glow-card overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-0.5">
      {/* Header row – clickable if detail is available */}
      <button
        onClick={() => hasDetail && setOpen((o) => !o)}
        className={cn(
          "flex w-full flex-col p-4 text-left",
          hasDetail && "cursor-pointer"
        )}
        aria-expanded={open}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-ribuzz-primary">
            {VARIABLE_LABELS[variable] ?? variable}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold text-white",
                scoreColor(score)
              )}
            >
              {scoreEstado(score)}
            </span>
            {hasDetail && (
              <span
                className={cn(
                  "text-xs text-ribuzz-muted transition-transform duration-300",
                  open && "rotate-180"
                )}
              >
                ▼
              </span>
            )}
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                n <= score ? scoreColor(score) : "bg-white/10"
              )}
            />
          ))}
        </div>

        {/* Confidence badge */}
        {detail?.confianza && (
          <p className="mt-2 text-xs text-ribuzz-muted">
            Confianza de datos:{" "}
            <span
              className={cn(
                "font-semibold",
                detail.confianza === "alta" && "text-score-escalable",
                detail.confianza === "media" && "text-score-funcional",
                detail.confianza === "baja" && "text-score-debil"
              )}
            >
              {detail.confianza}
            </span>
          </p>
        )}

        {metricValue && (
          <p className="mt-2 text-xs font-semibold text-ribuzz-cyan">
            Valor reportado: {metricValue}
          </p>
        )}

        {/* Preview of diagnostico when collapsed */}
        {!open && detail?.diagnostico && (
          <p className="mt-2 line-clamp-2 text-xs text-ribuzz-muted">
            {detail.diagnostico}
          </p>
        )}

        {hasDetail && (
          <p className="mt-2 text-xs text-ribuzz-accent">
            {open ? "Cerrar detalle ▲" : "Ver detalle completo ▼"}
          </p>
        )}
      </button>

      {/* Expanded detail panel */}
      {open && detail && (
        <div className="space-y-4 border-t border-white/10 bg-white/[0.03] p-4">
          {detail.evidencia && (
            <DetailRow
              label="Evidencia"
              value={detail.evidencia}
              accent="text-ribuzz-cyan"
            />
          )}
          <DetailRow label="Diagnóstico" value={detail.diagnostico} />
          <DetailRow label="Impacto" value={detail.impacto} />
          {detail.brecha && (
            <DetailRow
              label="Brecha a cerrar"
              value={detail.brecha}
              accent="text-yellow-400"
            />
          )}
          <DetailRow
            label="Recomendación"
            value={detail.recomendacion}
            accent="text-ribuzz-accent"
          />
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  accent = "text-ribuzz-cyan"
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <p className={cn("text-xs font-semibold uppercase tracking-wide", accent)}>
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ribuzz-muted">{value}</p>
    </div>
  );
}
