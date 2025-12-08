"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Truck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Image from "next/image"

const menuItems = [
  { href: "/sistema", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/sistema/orcamentos", icon: FileText, label: "Orçamentos" },
  { href: "/sistema/pdv", icon: ShoppingCart, label: "PDV" },
  { href: "/sistema/estoque", icon: Package, label: "Estoque" },
  { href: "/sistema/financeiro", icon: DollarSign, label: "Financeiro" },
  { href: "/sistema/clientes", icon: Users, label: "Clientes" },
  { href: "/sistema/fornecedores", icon: Truck, label: "Fornecedores" },
  { href: "/sistema/configuracoes", icon: Settings, label: "Configurações" },
]

export function SistemaSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "bg-[#0f2744] border-r border-[#1e3a5f] flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="p-4 border-b border-[#1e3a5f] flex items-center justify-between">
        {!collapsed && (
          <Image src="/images/thv-hidraulic-parts.png" alt="THV" width={120} height={40} className="h-8 w-auto" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-[#1e3a5f] text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/sistema" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive ? "bg-[#f97316] text-white" : "text-slate-400 hover:bg-[#1e3a5f] hover:text-white",
                collapsed && "justify-center",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
