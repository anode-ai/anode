import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/auth/auth-forms"

export const metadata: Metadata = { title: "Reset password — ANODE" }

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return <ForgotPasswordForm error={error} />
}
