"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso en componentes client.
 * Usa la anon key — todas las consultas pasan por RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
