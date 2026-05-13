"use client";

import { useState } from "react";
import type { PlaybookAccion } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlaybookAccordion({ acciones }: { acciones: PlaybookAccion[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {acciones.map((a, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="glow-card overflow-hidden rounded-2xl">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#211326] to-[#4F1263] text-xs font-bold text-white shadow-[0_0_14px_rgba(230,37,255,0.18)]">
                  {a.prioridad}
                </span>
                <h3 className="font-display font-semibold text-ribuzz-primary">{a.titulo}</h3>
              </div>
              <span
                className={cn(
                  "text-ribuzz-muted transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
              >
                ▼
              </span>
            </button>
            {isOpen && (
              <div className="space-y-3 border-t border-white/10 p-4 text-sm text-ribuzz-primary">
                <Row label="Qué corregir" value={a.que_corregir} />
                <Row label="Por qué" value={a.por_que} />
                <Row label="Cómo" value={a.como} />
                <Row label="Métrica" value={a.metrica} />
                <Row label="Resultado esperado" value={a.resultado_esperado} />
                <Row label="Tiempo estimado" value={a.tiempo_estimado} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ribuzz-cyan">
        {label}
      </p>
      <p className="mt-1 text-sm text-ribuzz-muted">{value}</p>
    </div>
  );
}
