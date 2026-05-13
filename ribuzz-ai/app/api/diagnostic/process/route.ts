import { NextResponse } from "next/server";
import { z } from "zod";
import { createServer, createServiceRole } from "@/lib/supabase/server";

export const maxDuration = 30;

const Body = z.object({ diagnostic_id: z.string().uuid() });

/**
 * POST /api/diagnostic/process
 *
 * Dispara el workflow multi-agente de n8n. NO espera a que termine —
 * crea un job en processing_jobs y devuelve job_id. El frontend hace
 * polling a /api/jobs/[id] para saber cuándo está listo.
 *
 * Variables de entorno requeridas:
 *   - N8N_WEBHOOK_URL     (ej. https://n8n.srv1097452.hstgr.cloud/webhook/ribuzz-diagnostic)
 *   - N8N_WEBHOOK_SECRET  (string aleatorio compartido con n8n)
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { diagnostic_id } = parsed.data;

  // 1. Auth
  const userClient = createServer();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = createServiceRole();

  // 2. Verifica que el diagnóstico exista y le pertenezca al usuario
  const { data: diag, error: diagErr } = await db
    .from("diagnostics")
    .select("id, status, company_id, companies!inner(user_id)")
    .eq("id", diagnostic_id)
    .maybeSingle();

  if (diagErr || !diag) {
    return NextResponse.json({ error: "diagnostic_not_found" }, { status: 404 });
  }
  if ((diag.companies as any).user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 3. Crea (o reutiliza) job en processing_jobs
  // Si ya hay uno en queued/running para este diagnóstico, lo reutilizamos
  const { data: existing } = await db
    .from("processing_jobs")
    .select("id, status")
    .eq("diagnostic_id", diagnostic_id)
    .in("status", ["queued", "running"])
    .maybeSingle();

  let jobId: string;
  if (existing) {
    jobId = existing.id;
  } else {
    const { data: job, error: jobErr } = await db
      .from("processing_jobs")
      .insert({ diagnostic_id, status: "queued", current_phase: "queued", progress_pct: 0 })
      .select("id")
      .single();
    if (jobErr || !job) {
      return NextResponse.json({ error: jobErr?.message ?? "job_create_failed" }, { status: 500 });
    }
    jobId = job.id;
  }

  // 4. Dispara webhook n8n (fire-and-forget; n8n actualiza el job)
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    return NextResponse.json(
      { error: "n8n_not_configured", hint: "Set N8N_WEBHOOK_URL and N8N_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  try {
    // No await el JSON, solo confirmamos que el webhook se aceptó.
    // n8n procesa en background y actualiza processing_jobs.
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ribuzz-secret": webhookSecret
      },
      body: JSON.stringify({ job_id: jobId, diagnostic_id }),
      // Timeout conservador para confirmación del trigger, no para el flow completo
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      await db
        .from("processing_jobs")
        .update({
          status: "failed",
          error_message: `n8n webhook returned ${res.status}: ${text.slice(0, 200)}`
        })
        .eq("id", jobId);
      return NextResponse.json(
        { error: "n8n_webhook_failed", status: res.status },
        { status: 502 }
      );
    }
  } catch (e: any) {
    // Si n8n NO responde rápido, eso NO necesariamente es error: el flow
    // puede tardar más en producción. Pero si fetch directamente falla
    // (red, DNS, etc.) marcamos failed.
    if (e?.name !== "TimeoutError" && e?.name !== "AbortError") {
      await db
        .from("processing_jobs")
        .update({
          status: "failed",
          error_message: `n8n unreachable: ${e?.message ?? "unknown"}`
        })
        .eq("id", jobId);
      return NextResponse.json({ error: "n8n_unreachable" }, { status: 502 });
    }
    // TimeoutError = n8n recibió el trigger pero el flow tarda más que
    // nuestra espera. Eso está bien — seguimos por polling.
  }

  return NextResponse.json({ ok: true, job_id: jobId });
}
