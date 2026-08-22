import type { ReactNode } from "react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 flex w-full flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 bg-accent" aria-hidden="true" />
          <span className="font-[family-name:var(--font-bebas)] text-3xl leading-none tracking-wide text-foreground">
            ANODE
          </span>
        </Link>

        {children}
      </div>
    </main>
  )
}
