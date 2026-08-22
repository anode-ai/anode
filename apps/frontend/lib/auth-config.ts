/** Shared auth routing rules, used by the middleware guard, the auth actions and the callback route. */

/** Pages that require a signed-in user. */
export const PROTECTED_ROUTES = ["/dashboard", "/reset-password"]

/** Pages a signed-in user has no business seeing. `/reset-password` is deliberately absent:
 *  the recovery link signs the user in before they set a new password. */
export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"]

export const DEFAULT_SIGNED_IN_ROUTE = "/dashboard"

export function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

/**
 * Only ever redirect to a path on this origin. Protocol-relative (`//evil.com`) and
 * absolute URLs are rejected so a crafted `?next=` can't be used as an open redirect.
 */
export function safeRedirect(next: unknown, fallback = DEFAULT_SIGNED_IN_ROUTE) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback
}
