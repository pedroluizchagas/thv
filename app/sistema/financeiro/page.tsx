import { createClient } from "@/lib/supabase/server"
import { FinanceiroClient } from "@/components/sistema/financeiro/financeiro-client"

async function getFinanceiroData() {
  const supabase = await createClient()

  // Get current month dates
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

  const { data: transactions, error } = await supabase
    .from("financial_transactions")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return { transactions: [], monthlyData: { income: 0, expense: 0 } }
  }

  // Calculate monthly totals
  const monthlyTransactions =
    transactions?.filter((t) => t.transaction_date >= firstDayOfMonth && t.transaction_date <= lastDayOfMonth) || []

  const monthlyData = {
    income: monthlyTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0),
    expense: monthlyTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0),
  }

  return {
    transactions: transactions || [],
    monthlyData,
  }
}

export default async function FinanceiroPage() {
  const { transactions, monthlyData } = await getFinanceiroData()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Financeiro</h2>
        <p className="text-slate-400">Fluxo de caixa e movimentações financeiras</p>
      </div>

      <FinanceiroClient initialTransactions={transactions} monthlyData={monthlyData} />
    </div>
  )
}
