import Link from "next/link";
import { redirect } from "next/navigation";
import { createServer, hasSupabaseServerEnv } from "@/lib/supabase/server";

export default async function ProfilePage() {
  if (!hasSupabaseServerEnv()) redirect("/login");

  const supabase = createServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, sector")
    .eq("user_id", user.id);

  const companyIds = (companies ?? []).map((c) => c.id);
  const { data: diagnostics } = await supabase
    .from("diagnostics")
    .select("id, status, current_question, created_at, completed_at")
    .in("company_id", companyIds.length ? companyIds : ["00000000-0000-0000-0000-000000000000"])
    .order("created_at", { ascending: false });

  return (
    <main className="ribuzz-shell mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Hola, {user.email}</h1>
          <p className="mt-2 text-ribuzz-muted">Estos son tus diagnósticos.</p>
        </div>
        <Link
          href="/diagnostic?new=1"
          className="inline-flex items-center justify-center rounded-full border border-ribuzz-accent/28 bg-gradient-to-br from-[#211326] to-[#3A2148] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(230,37,255,0.11)] transition hover:border-ribuzz-accent/45"
        >
          Nuevo diagnóstico
        </Link>
      </div>

      <section className="mt-8 space-y-3">
        {(diagnostics ?? []).map((d) => (
          <div
            key={d.id}
            className="glow-card flex items-center justify-between rounded-3xl p-4"
          >
            <div>
              <p className="font-medium">Diagnóstico {d.id.slice(0, 8)}</p>
              <p className="text-sm text-ribuzz-muted">
                {d.status === "completed"
                  ? `Completado · ${new Date(d.completed_at ?? d.created_at).toLocaleDateString("es-CO")}`
                  : `En progreso · pregunta ${d.current_question}/40`}
              </p>
            </div>
            <Link
              href={d.status === "completed" ? `/results?d=${d.id}` : "/diagnostic"}
              className="text-ribuzz-pink hover:underline"
            >
              {d.status === "completed" ? "Ver resultados" : "Continuar"}
            </Link>
          </div>
        ))}
        {(diagnostics ?? []).length === 0 && (
          <Link
            href="/diagnostic"
            className="block rounded-3xl border-2 border-dashed border-ribuzz-accent/28 bg-white/[0.04] p-8 text-center text-ribuzz-muted transition hover:border-ribuzz-accent/45 hover:bg-white/[0.08]"
          >
            No tienes diagnósticos. Iniciar uno →
          </Link>
        )}
      </section>
    </main>
  );
}
