import { createServiceRole } from "@/lib/supabase/server";
import { LeadTable, type LeadRow } from "@/components/admin/LeadTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createServiceRole();

  const { data, error } = await supabase
    .from("diagnostics")
    .select(`
      id,
      created_at,
      companies(name, sector),
      scores(score_global),
      leads(status, fit_level)
    `)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return <p className="p-8 text-red-600">Error: {error.message}</p>;
  }

  const rows: LeadRow[] = (data ?? []).map((d: any) => ({
    diagnostic_id: d.id,
    empresa: d.companies?.name ?? "—",
    sector: d.companies?.sector ?? "—",
    score_global: d.scores?.[0]?.score_global ?? null,
    status: d.leads?.[0]?.status ?? null,
    fit_level: d.leads?.[0]?.fit_level ?? null,
    created_at: d.created_at
  }));

  return (
    <main className="ribuzz-shell mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Panel RiBuzz</h1>
          <p className="text-sm text-ribuzz-muted">
            {rows.length} diagnósticos completados
          </p>
        </div>
        <a
          href="/api/admin/leads?format=csv"
          className="rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-bold text-ribuzz-primary hover:border-ribuzz-cyan/40"
        >
          Exportar CSV
        </a>
      </header>
      <LeadTable rows={rows} />
    </main>
  );
}
