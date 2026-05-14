import type { TopFuga } from "@/lib/types";
import { VARIABLE_LABELS } from "@/lib/utils";

export function FugasCard({ fugas }: { fugas: TopFuga[] }) {
  return (
    <div className="glow-card rounded-3xl border-ribuzz-accent/18 p-5">
      <h2 className="font-display text-xl font-semibold text-ribuzz-primary">
        Top 3 fugas comerciales
      </h2>
      <p className="mt-1 text-sm text-ribuzz-muted">
        Las 3 áreas con mayor potencial de mejora para tus ingresos.
      </p>
      <ol className="mt-5 space-y-4">
        {fugas.map((f) => (
          <li
            key={f.variable}
            className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition duration-500 hover:-translate-y-0.5 hover:border-ribuzz-accent/22"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ribuzz-accent/25 bg-ribuzz-accent/[0.06] text-sm font-bold text-ribuzz-pink shadow-[0_0_14px_rgba(230,37,255,0.1)]">
              {f.prioridad}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-ribuzz-primary">
                {VARIABLE_LABELS[f.variable] ?? f.variable}
              </p>
              <p className="mt-1 text-sm text-ribuzz-muted">{f.diagnostico}</p>
              <p className="mt-2 text-sm text-ribuzz-muted">
                <strong className="text-ribuzz-pink">Recomendación: </strong>
                {f.recomendacion}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
