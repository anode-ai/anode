import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { AUTH_ROUTES, DEFAULT_SIGNED_IN_ROUTE, PROTECTED_ROUTES, matchesRoute } from "@/lib/auth-config"

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

function redirect(request: NextRequest, pathname: string, params?: Record<string, string>) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ""
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value))
  return NextResponse.redirect(url)
}

/** Refreshes the auth cookies on every request and guards protected pages. */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Fail closed: without Supabase credentials nothing behind the guard is reachable,
  // but the public marketing site keeps working.
  if (!isConfigured) {
    return matchesRoute(pathname, PROTECTED_ROUTES)
      ? redirect(request, "/login", { error: "Authentication is not configured yet." })
      : NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and supabase.auth.getClaims(): anything
  // in between can leave users randomly logged out. getClaims verifies the JWT signature,
  // unlike getSession, which is why it is the one safe check on the server.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims && matchesRoute(pathname, PROTECTED_ROUTES)) {
    const next = `${pathname}${request.nextUrl.search}`
    return redirect(request, "/login", next === DEFAULT_SIGNED_IN_ROUTE ? {} : { next })
  }

  if (claims && matchesRoute(pathname, AUTH_ROUTES)) {
    return redirect(request, DEFAULT_SIGNED_IN_ROUTE)
  }

  // Must be returned as-is. Building a fresh response without copying these cookies
  // desynchronises the browser and server and kills the session early.
  return supabaseResponse
}
