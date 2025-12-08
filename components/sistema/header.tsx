"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface SistemaHeaderProps {
  user: SupabaseUser
}

export function SistemaHeader({ user }: SistemaHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="h-16 bg-[#0f2744] border-b border-[#1e3a5f] flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Sistema THV</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-[#1e3a5f]">
          <Bell className="w-5 h-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-[#1e3a5f]"
            >
              <div className="w-8 h-8 rounded-full bg-[#f97316] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:inline">{user.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#0f2744] border-[#1e3a5f]">
            <DropdownMenuItem className="text-slate-300 focus:bg-[#1e3a5f] focus:text-white">
              <User className="w-4 h-4 mr-2" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1e3a5f]" />
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-[#1e3a5f] focus:text-red-300">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
