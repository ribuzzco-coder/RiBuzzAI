"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase/client";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const SECTORS = [
  { value: "servicios_b2b", label: "Servicios B2B" },
  { value: "educacion", label: "Educación digital" },
  { value: "turismo", label: "Turismo" },
  { value: "salud", label: "Salud y wellness" },
  { value: "comercio", label: "Comercio por redes" },
  { value: "otro", label: "Otro" }
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    whatsapp: "",
    sector: "" as any
  });
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accept) {
      setError("Debes aceptar el tratamiento de datos (Ley 1581).");
      return;
    }
    if (!form.sector) {
      setError("Selecciona un sector.");
      return;
    }
    setLoading(true);
    setError(null);

    if (!hasSupabaseBrowserEnv()) {
      setLoading(false);
      setError("Falta configurar Supabase en Vercel: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    const supabase = createClient();

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, whatsapp: form.whatsapp }
      }
    });

    if (signUpErr || !data.user) {
      setLoading(false);
      setError(signUpErr?.message ?? "No se pudo crear la cuenta.");
      return;
    }

    // Crear la empresa asociada
    const { error: companyErr } = await supabase.from("companies").insert({
      user_id: data.user.id,
      name: form.company,
      sector: form.sector
    });

    setLoading(false);
    if (companyErr) {
      setError(`Cuenta creada pero falló registrar empresa: ${companyErr.message}`);
      return;
    }

    router.push("/diagnostic");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold text-ribuzz-primary">Crear cuenta</h1>
      <p className="mt-2 text-sm text-ribuzz-muted">
        Toma 1 minuto. Empezarás el diagnóstico al terminar.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Nombre completo">
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </Field>
        <Field label="Empresa">
          <Input value={form.company} onChange={(e) => update("company", e.target.value)} required />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        </Field>
        <Field label="Contraseña (mín. 6 caracteres)">
          <Input type="password" minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} required />
        </Field>
        <Field label="WhatsApp (con +57)">
          <Input type="tel" placeholder="+57 300 1234567" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} required />
        </Field>
        <Field label="Sector">
          <Select options={SECTORS} value={form.sector as any} onChange={(e: any) => update("sector", e.target.value)} required />
        </Field>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            className="mt-1"
          />
          <span>
            Acepto el tratamiento de mis datos personales bajo la Ley 1581 de 2012.
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Crear cuenta y empezar
        </Button>
      </form>

      <p className="mt-6 text-sm text-ribuzz-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-ribuzz-accent hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-ribuzz-primary">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
