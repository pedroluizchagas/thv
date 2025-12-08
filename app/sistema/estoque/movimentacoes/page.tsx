import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, RefreshCw, Package } from "lucide-react"

async function getMovements() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("stock_movements")
    .select("*, product:products(name, code)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching movements:", error)
    return []
  }

  return data || []
}

export default async function MovimentacoesPage() {
  const movements = await getMovements()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Movimentações de Estoque</h2>
        <p className="text-slate-400">Histórico de entradas, saídas e ajustes</p>
      </div>

      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <CardTitle className="text-white">Últimas Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma movimentação registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="flex items-center gap-4 p-4 bg-[#1e3a5f]/50 rounded-lg">
                  <div
                    className={`p-2 rounded-lg ${
                      movement.type === "in"
                        ? "bg-green-500/20"
                        : movement.type === "out"
                          ? "bg-red-500/20"
                          : "bg-blue-500/20"
                    }`}
                  >
                    {movement.type === "in" ? (
                      <ArrowUp className="w-5 h-5 text-green-500" />
                    ) : movement.type === "out" ? (
                      <ArrowDown className="w-5 h-5 text-red-500" />
                    ) : (
                      <RefreshCw className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{movement.product?.name || "Produto removido"}</p>
                    <p className="text-xs text-slate-500">
                      {movement.product?.code} |{" "}
                      {movement.reference_type === "sale"
                        ? "Venda"
                        : movement.reference_type === "purchase"
                          ? "Compra"
                          : "Ajuste Manual"}
                    </p>
                    {movement.notes && <p className="text-sm text-slate-400 mt-1">{movement.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        movement.type === "in"
                          ? "text-green-500"
                          : movement.type === "out"
                            ? "text-red-500"
                            : "text-blue-500"
                      }`}
                    >
                      {movement.type === "in" ? "+" : movement.type === "out" ? "-" : "±"}
                      {Math.abs(movement.quantity)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(movement.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
