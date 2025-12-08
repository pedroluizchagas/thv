import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Calendar, User, CreditCard } from "lucide-react"

const paymentLabels: Record<string, string> = {
  cash: "Dinheiro",
  credit: "Crédito",
  debit: "Débito",
  pix: "PIX",
  transfer: "Transferência",
  boleto: "Boleto",
}

async function getSalesHistory() {
  const supabase = await createClient()

  const { data: sales, error } = await supabase
    .from("sales")
    .select("*, customer:customers(*), items:sale_items(*)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching sales:", error)
    return []
  }

  return sales || []
}

export default async function HistoricoVendasPage() {
  const sales = await getSalesHistory()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Histórico de Vendas</h2>
        <p className="text-slate-400">Visualize todas as vendas realizadas</p>
      </div>

      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <CardTitle className="text-white">Últimas Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma venda registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div key={sale.id} className="bg-[#1e3a5f]/50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-medium">Venda #{sale.sale_number}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            sale.status === "completed"
                              ? "bg-green-500/20 text-green-500"
                              : sale.status === "cancelled"
                                ? "bg-red-500/20 text-red-500"
                                : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {sale.status === "completed"
                            ? "Concluída"
                            : sale.status === "cancelled"
                              ? "Cancelada"
                              : "Pendente"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(sale.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {sale.customer?.name || "Cliente não informado"}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {paymentLabels[sale.payment_method] || sale.payment_method}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{sale.items?.length || 0} item(ns)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#f97316]">
                        R$ {Number(sale.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      {sale.discount > 0 && (
                        <p className="text-xs text-slate-500">
                          Desconto: R$ {Number(sale.discount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
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
