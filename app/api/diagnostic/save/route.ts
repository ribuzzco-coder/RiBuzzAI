import { NextResponse } from "next/server";
import { z } from "zod";
import { createServer } from "@/lib/supabase/server";

const Body = z.object({
  diagnostic_id: z.string().uuid(),
  question_number: z.number().int().min(1).max(40),
  variable_bd: z.string().min(1),
  question_text: z.string().min(1),
  answer_text: z.string().optional().default(""),
  is_unknown: z.boolean().default(false),
  is_fused: z.boolean().default(false)
});

/**
 * POST /api/diagnostic/save
 * Guarda una respuesta del diagnóstico en tiempo real.
 * Idempotente sobre (diagnostic_id, question_number, variable_bd).
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const body = parsed.data;
  const supabase = createServer();

  // Auth check — RLS hace el resto
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Upsert respuesta
  const { error: upErr } = await supabase
    .from("diagnostic_answers")
    .upsert(
      {
        diagnostic_id: body.diagnostic_id,
        question_number: body.question_number,
        variable_bd: body.variable_bd,
        question_text: body.question_text,
        answer_text: body.is_unknown ? null : body.answer_text,
        is_unknown: body.is_unknown,
        is_fused: body.is_fused
      },
      { onConflict: "diagnostic_id,question_number,variable_bd" }
    );

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Avanzar puntero del diagnóstico
  await supabase
    .from("diagnostics")
    .update({ current_question: Math.min(body.question_number + 1, 40) })
    .eq("id", body.diagnostic_id);

  return NextResponse.json({ ok: true });
}
