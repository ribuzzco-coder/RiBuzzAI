"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso en componentes client.
 * Usa la anon key — todas las consultas pasan por RLS.
 */
export function createClient() {
  if (!hasSupabaseBrowserEnv()) {
    throw new Error("missing_supabase_browser_env");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function hasSupabaseBrowserEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
