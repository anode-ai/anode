import type { Metadata } from "next"
import { SignUpForm } from "@/components/auth/auth-forms"

export const metadata: Metadata = { title: "Create account — ANODE" }

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  return <SignUpForm next={next} error={error} />
}
