import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ShoppingCart, Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import Link from "next/link"

async function getDashboardData() {
  const supabase = await createClient()

  const [
    { count: pendingQuotes },
    { count: totalProducts },
    { data: lowStockProducts },
    { data: todaySales },
    { data: todayTransactions },
    { data: recentQuotes },
  ] = await Promise.all([
    supabase.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("*").lt("stock_quantity", 5).eq("is_active", true),
    supabase
      .from("sales")
      .select("total")
      .gte("created_at", new Date().toISOString().split("T")[0])
      .eq("status", "completed"),
    supabase
      .from("financial_transactions")
      .select("type, amount")
      .gte("transaction_date", new Date().toISOString().split("T")[0]),
    supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  const todayRevenue = todaySales?.reduce((acc, sale) => acc + Number(sale.total), 0) || 0
  const todayIncome =
    todayTransactions?.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0) || 0
  const todayExpense =
    todayTransactions?.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0) || 0

  return {
    pendingQuotes: pendingQuotes || 0,
    totalProducts: totalProducts || 0,
    lowStockCount: lowStockProducts?.length || 0,
    todayRevenue,
    todayIncome,
    todayExpense,
    recentQuotes: recentQuotes || [],
  }
}

export default async function SistemaPage() {
  const data = await getDashboardData()

  const stats = [
    {
      title: "Orçamentos Pendentes",
      value: data.pendingQuotes,
      icon: FileText,
      href: "/sistema/orcamentos",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Vendas Hoje",
      value: `R$ ${data.todayRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: ShoppingCart,
      href: "/sistema/pdv",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Produtos Cadastrados",
      value: data.totalProducts,
      icon: Package,
      href: "/sistema/estoque",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Estoque Baixo",
      value: data.lowStockCount,
      icon: AlertTriangle,
      href: "/sistema/estoque?filter=low",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400">Visão geral do sistema THV Hidraulic Parts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="bg-[#0f2744] border-[#1e3a5f] hover:border-[#f97316]/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Entradas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">
              R$ {data.todayIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Saídas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              R$ {data.todayExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quotes */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <CardTitle className="text-white">Últimas Solicitações de Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentQuotes.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Nenhuma solicitação recente</p>
          ) : (
            <div className="space-y-4">
              {data.recentQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-4 bg-[#1e3a5f]/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{quote.name}</p>
                    <p className="text-sm text-slate-400">{quote.email}</p>
                    {quote.product_name && <p className="text-sm text-[#f97316]">{quote.product_name}</p>}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        quote.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : quote.status === "contacted"
                            ? "bg-blue-500/20 text-blue-500"
                            : quote.status === "quoted"
                              ? "bg-purple-500/20 text-purple-500"
                              : quote.status === "converted"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {quote.status === "pending"
                        ? "Pendente"
                        : quote.status === "contacted"
                          ? "Contatado"
                          : quote.status === "quoted"
                            ? "Orçado"
                            : quote.status === "converted"
                              ? "Convertido"
                              : "Cancelado"}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(quote.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
