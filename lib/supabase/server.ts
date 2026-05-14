import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

type CookieToSet = {
  name: string;
  value: string;
  options?: Partial<ResponseCookie>;
};

export function hasSupabaseServerEnv({ serviceRole = false } = {}) {
  const baseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  if (!serviceRole) return baseConfigured;
  return baseConfigured && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Cliente Supabase para Server Components / Route Handlers
 * con la sesión del usuario (anon key + cookies). RLS aplica.
 */
export function createServer() {
  if (!hasSupabaseServerEnv()) {
    throw new Error("Missing Supabase environment variables");
  }
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components no permiten set — ignorar.
          }
        }
      }
    }
  );
}

/**
 * Cliente con service_role — bypasea RLS.
 * USAR SOLO en API Routes server-side. Nunca en código cliente.
 */
export function createServiceRole() {
  if (!hasSupabaseServerEnv({ serviceRole: true })) {
    throw new Error("Missing Supabase service-role environment variables");
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
