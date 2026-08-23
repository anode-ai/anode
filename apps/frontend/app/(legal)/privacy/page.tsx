import type { Metadata } from "next"
import { LegalDocument } from "@/components/anode/legal-document"
import { PRIVACY_POLICY } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Privacy Policy — ANODE",
  description: "What Anode collects, why we collect it, and the choices you have.",
}

export default function PrivacyPage() {
  return <LegalDocument doc={PRIVACY_POLICY} />
}
