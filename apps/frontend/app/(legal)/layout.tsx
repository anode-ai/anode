import type { ReactNode } from "react"
import Link from "next/link"

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        <div className="border-b border-border/40 px-6 py-5 md:px-12">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 bg-accent" aria-hidden="true" />
            <span className="font-[family-name:var(--font-bebas)] text-2xl leading-none tracking-wide text-foreground">
              ANODE
            </span>
          </Link>
        </div>

        {children}
      </div>
    </main>
  )
}
