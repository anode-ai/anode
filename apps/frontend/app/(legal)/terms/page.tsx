import type { Metadata } from "next"
import { LegalDocument } from "@/components/anode/legal-document"
import { TERMS_OF_SERVICE } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Terms of Service — ANODE",
  description: "The agreement between you and Anode — accounts, your content, AI output, and liability.",
}

export default function TermsPage() {
  return <LegalDocument doc={TERMS_OF_SERVICE} />
}
