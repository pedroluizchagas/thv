import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SistemaHeader } from "@/components/sistema/header"
import { SistemaSidebar } from "@/components/sistema/sidebar"

export default async function SistemaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#0a1628]">
      <SistemaSidebar />
      <div className="flex-1 flex flex-col">
        <SistemaHeader user={data.user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
