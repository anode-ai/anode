import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/auth-forms"

export const metadata: Metadata = { title: "Sign in — ANODE" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  return <LoginForm next={next} error={error} />
}
