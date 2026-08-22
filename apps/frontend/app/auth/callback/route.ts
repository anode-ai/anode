import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { safeRedirect } from "@/lib/auth-config"

/**
 * Single landing point for every email and OAuth redirect.
 * Handles both link styles Supabase can send: `?code=` (PKCE / OAuth) and
 * `?token_hash=&type=` (email templates using the token helper).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null

  // A recovery link always lands on the set-a-new-password screen.
  const next = type === "recovery" ? "/reset-password" : safeRedirect(searchParams.get("next"))

  let error: { message: string } | null = { message: "This link is invalid or has already been used." }

  if (code || (tokenHash && type)) {
    const supabase = await createClient()
    const result = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type: type!, token_hash: tokenHash! })
    error = result.error
  }

  // Behind a proxy the forwarded host is the address the user actually typed.
  const forwardedHost = request.headers.get("x-forwarded-host")
  const base = process.env.NODE_ENV === "development" || !forwardedHost ? origin : `https://${forwardedHost}`

  if (error) {
    return NextResponse.redirect(`${base}/login?error=${encodeURIComponent(error.message)}`)
  }
  return NextResponse.redirect(`${base}${next}`)
}
