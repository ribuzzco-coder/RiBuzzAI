import { cn, scoreColor, scoreEstado, VARIABLE_LABELS } from "@/lib/utils";

interface Props {
  variable: string;
  score: number;
  diagnostico?: string;
}

export function ScoreCard({ variable, score, diagnostico }: Props) {
  return (
    <div className="glow-card rounded-2xl p-4 transition duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ribuzz-primary">
          {VARIABLE_LABELS[variable] ?? variable}
        </h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold text-white",
            scoreColor(score)
          )}
        >
          {scoreEstado(score)}
        </span>
      </div>
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
      {diagnostico && (
        <p className="mt-3 text-sm text-ribuzz-muted">{diagnostico}</p>
      )}
    </div>
  );
}
