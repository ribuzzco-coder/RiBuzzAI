import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

/**
 * GET /api/jobs/[id]
 * Devuelve estado del job de procesamiento multi-agente.
 * El frontend de /processing hace polling cada 2s a este endpoint.
 *
 * Response shape:
 *   {
 *     status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled',
 *     current_phase: string | null,
 *     progress_pct: number,
 *     error_message: string | null,
 *     diagnostic_id: string,
 *     started_at: string,
 *     completed_at: string | null
 *   }
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // RLS hace cumplir que el usuario solo vea jobs de SUS diagnósticos
  const { data, error } = await supabase
    .from("processing_jobs")
    .select(
      "id, diagnostic_id, status, current_phase, progress_pct, error_message, started_at, completed_at"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)  return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" }
  });
}
