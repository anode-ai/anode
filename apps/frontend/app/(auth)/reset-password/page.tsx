import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/auth-forms"

export const metadata: Metadata = { title: "New password — ANODE" }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return <ResetPasswordForm error={error} />
}
