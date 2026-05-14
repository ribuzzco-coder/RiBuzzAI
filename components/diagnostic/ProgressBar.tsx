"use client";

import { SECCION_LABELS } from "@/lib/questions";

interface Props {
  current: number;
  total: number;
  seccion: keyof typeof SECCION_LABELS;
}

export function ProgressBar({ current, total, seccion }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="animate-rise-delay w-full rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.14em] text-ribuzz-muted">
        <span>
          Sección {seccion} · {SECCION_LABELS[seccion]}
        </span>
        <span className="text-ribuzz-champagne">
          {current} de {total} · {pct}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-black/35">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2B2234] to-ribuzz-champagne shadow-[0_0_12px_rgba(201,179,126,0.14)] transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
