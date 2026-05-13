"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <LoginShell>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-semibold text-ribuzz-muted">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-ribuzz-muted">Contraseña</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="rounded-2xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-sm text-ribuzz-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-bold text-ribuzz-pink hover:text-ribuzz-cyan">
          Regístrate
        </Link>
      </p>
    </LoginShell>
  );
}

function LoginShell({ children }: { children?: React.ReactNode }) {
  return (
    <main className="ribuzz-shell mx-auto grid min-h-screen max-w-md place-items-center px-6 py-12">
      <section className="glow-card animate-rise w-full rounded-[2rem] p-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ribuzz-cyan">
          RiBuzz AI
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ribuzz-primary">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm text-ribuzz-muted">
          Accede a tu diagnóstico y resultados.
        </p>
        {children}
      </section>
    </main>
  );
}
