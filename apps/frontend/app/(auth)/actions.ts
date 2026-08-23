"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_SIGNED_IN_ROUTE, safeRedirect } from "@/lib/auth-config"

export interface AuthState {
  error?: string
  message?: string
}

const email = z.string().trim().min(1, "Enter your email address.").email("That email address doesn't look right.")
const password = z.string().min(8, "Use at least 8 characters for your password.")

const credentialsSchema = z.object({ email, password })
const signUpSchema = credentialsSchema.extend({
  name: z.string().trim().min(1, "Tell us what to call you.").max(80, "That name is too long."),
})
const emailSchema = z.object({ email })
const newPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Both passwords need to match.",
    path: ["confirmPassword"],
  })

function firstError(error: z.ZodError): AuthState {
  return { error: error.issues[0]?.message ?? "Check the form and try again." }
}

/** Absolute origin for email and OAuth redirects. Set NEXT_PUBLIC_SITE_URL in production. */
async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  const headerList = await headers()
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000"
  const protocol = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  return `${protocol}://${host}`
}

async function callbackUrl(next: string) {
  return `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) return firstError(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  redirect(safeRedirect(formData.get("next")))
}

export async function signUp(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) return firstError(parsed.error)

  const next = safeRedirect(formData.get("next"))
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
      emailRedirectTo: await callbackUrl(next),
    },
  })
  if (error) return { error: error.message }

  // Supabase returns a decoy user with no identities when the email is already taken,
  // so the response can't be used to probe for registered accounts. Mirror that wording.
  if (data.user && data.user.identities?.length === 0) {
    return { message: "Check your email to finish setting up your account." }
  }

  // No session means email confirmation is switched on for this project.
  if (!data.session) return { message: "Almost there — confirm your email address to activate your account." }

  revalidatePath("/", "layout")
  redirect(next)
}

export async function requestPasswordReset(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") })
  if (!parsed.success) return firstError(parsed.error)

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: await callbackUrl("/reset-password"),
  })

  // Always the same answer, whether or not the account exists — otherwise this form
  // becomes a way to enumerate registered emails.
  return { message: "If that email has an account, a reset link is on its way." }
}

export async function updatePassword(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) return firstError(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  redirect(DEFAULT_SIGNED_IN_ROUTE)
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeRedirect(formData.get("next"))
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: await callbackUrl(next) },
  })

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Could not reach Google. Try again.")}`)
  }
  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
