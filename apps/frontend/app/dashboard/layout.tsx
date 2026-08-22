import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { AnodeStoreProvider } from "@/lib/anode-store"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // The middleware already turns anonymous traffic away; this second check keeps the
  // guard next to the data it protects rather than trusting routing alone.
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims) redirect("/login?next=/dashboard")

  const metadata = (claims.user_metadata ?? {}) as { full_name?: string; name?: string }

  return (
    <AnodeStoreProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar
          user={{
            name: metadata.full_name ?? metadata.name,
            email: typeof claims.email === "string" ? claims.email : undefined,
          }}
        />
        <main className="flex-1 md:pl-[220px]">{children}</main>
      </div>
    </AnodeStoreProvider>
  )
}
