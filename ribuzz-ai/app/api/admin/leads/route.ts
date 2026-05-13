import { NextResponse } from "next/server";
import { z } from "zod";
import { createServer, createServiceRole } from "@/lib/supabase/server";

function isAdminEmail(email: string | undefined | null) {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

async function requireAdmin() {
  const userClient = createServer();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return { ok: false as const };
  }
  return { ok: true as const, user };
}

const PatchBody = z.object({
  diagnostic_id: z.string().uuid(),
  status: z.string().optional(),
  internal_notes: z.string().optional(),
  next_action: z.string().optional(),
  next_action_at: z.string().optional()
});

/**
 * GET  /api/admin/leads?format=csv  → exporta CSV
 * PATCH /api/admin/leads            → actualiza status / notas
 */
export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const db = createServiceRole();

  const { data, error } = await db
    .from("diagnostics")
    .select(`
      id, created_at,
      companies(name, sector, city),
      scores(score_global),
      leads(status, fit_level, urgency, suggested_route, opening_message)
    `)
    .eq("status", "completed")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (url.searchParams.get("format") === "csv") {
    const header = [
      "diagnostic_id", "empresa", "sector", "ciudad",
      "score_global", "status", "fit_level", "urgency",
      "ruta_sugerida", "created_at"
    ].join(",");
    const rows = (data ?? []).map((d: any) => [
      d.id,
      escapeCsv(d.companies?.name ?? ""),
      d.companies?.sector ?? "",
      d.companies?.city ?? "",
      d.scores?.[0]?.score_global ?? "",
      d.leads?.[0]?.status ?? "",
      d.leads?.[0]?.fit_level ?? "",
      d.leads?.[0]?.urgency ?? "",
      d.leads?.[0]?.suggested_route ?? "",
      d.created_at
    ].join(","));
    const csv = [header, ...rows].join("\n");
    const today = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ribuzz_leads_${today}.csv"`
      }
    });
  }

  return NextResponse.json({ data });
}

function escapeCsv(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const parsed = PatchBody.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { diagnostic_id, ...patch } = parsed.data;

  const db = createServiceRole();
  const { error } = await db.from("leads").update(patch).eq("diagnostic_id", diagnostic_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
