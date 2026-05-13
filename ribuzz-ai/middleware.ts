import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

type CookieToSet = {
  name: string;
  value: string;
  options?: Partial<ResponseCookie>;
};

/**
 * Middleware de Supabase Auth.
 * - Refresca la sesión en cada request
 * - Protege rutas privadas: /diagnostic, /processing, /results, /profile, /admin
 * - Restringe /admin a los emails listados en ADMIN_EMAILS
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  // Si las env vars de Supabase no están configuradas (ej. primer
  // arranque local sin .env.local), no bloqueamos nada para que al
  // menos la landing renderice. El dev verá un placeholder hasta
  // que cargue sus claves reales.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const PROTECTED = ["/diagnostic", "/processing", "/results", "/profile", "/admin"];
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Guard de admin por allowlist de emails
  if (pathname.startsWith("/admin") && user) {
    const allowed = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (!allowed.includes((user.email ?? "").toLowerCase())) {
      const url = request.nextUrl.clone();
      url.pathname = "/profile";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)).*)"]
};
