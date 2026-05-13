import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export interface LeadRow {
  diagnostic_id: string;
  empresa: string;
  sector: string;
  score_global: number | null;
  status: string | null;
  fit_level: string | null;
  created_at: string;
}

const statusTone: Record<string, "info" | "success" | "warning" | "neutral" | "danger"> = {
  mql: "info",
  sql: "success",
  contacted: "warning",
  meeting_scheduled: "success",
  won: "success",
  lost: "danger",
  no_fit: "neutral"
};

export function LeadTable({ rows }: { rows: LeadRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-ribuzz-accent/35 bg-white/[0.04] p-8 text-center text-ribuzz-muted">
        Sin leads todavía. Cuando alguien complete el diagnóstico aparecerá aquí.
      </p>
    );
  }
  return (
    <div className="glow-card overflow-hidden rounded-3xl">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.06] text-left text-xs uppercase text-ribuzz-muted">
          <tr>
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Sector</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Fit</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((r) => (
            <tr key={r.diagnostic_id} className="transition hover:bg-white/[0.06]">
              <td className="px-4 py-3 font-medium text-ribuzz-primary">{r.empresa}</td>
              <td className="px-4 py-3 text-ribuzz-muted">{r.sector}</td>
              <td className="px-4 py-3">{r.score_global?.toFixed(1) ?? "—"}</td>
              <td className="px-4 py-3">
                {r.status ? (
                  <Badge tone={statusTone[r.status] ?? "neutral"}>{r.status}</Badge>
                ) : (
                  <span className="text-ribuzz-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-ribuzz-muted">{r.fit_level ?? "—"}</td>
              <td className="px-4 py-3 text-ribuzz-muted">
                {new Date(r.created_at).toLocaleDateString("es-CO")}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/${r.diagnostic_id}`}
                  className="text-ribuzz-accent hover:underline"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
