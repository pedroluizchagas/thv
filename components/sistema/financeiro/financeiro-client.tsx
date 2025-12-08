"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Calendar,
  Trash2,
  ShoppingCart,
  Package,
} from "lucide-react"
import type { FinancialTransaction } from "@/lib/types"

const incomeCategories = ["Venda", "Serviço", "Outros Recebimentos"]
const expenseCategories = [
  "Compra",
  "Fornecedor",
  "Aluguel",
  "Energia",
  "Água",
  "Internet",
  "Telefone",
  "Salários",
  "Impostos",
  "Manutenção",
  "Combustível",
  "Material de Escritório",
  "Marketing",
  "Outros Gastos",
]

const paymentMethods = [
  { value: "cash", label: "Dinheiro" },
  { value: "credit", label: "Cartão Crédito" },
  { value: "debit", label: "Cartão Débito" },
  { value: "pix", label: "PIX" },
  { value: "transfer", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
]

interface FinanceiroClientProps {
  initialTransactions: FinancialTransaction[]
  monthlyData: { income: number; expense: number }
}

export function FinanceiroClient({ initialTransactions, monthlyData }: FinanceiroClientProps) {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialTransactions)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [periodFilter, setPeriodFilter] = useState<string>("month")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    category: "",
    description: "",
    amount: 0,
    payment_method: "pix",
    transaction_date: new Date().toISOString().split("T")[0],
  })

  // Calculate totals based on period
  const getFilteredByPeriod = (txs: FinancialTransaction[]) => {
    const now = new Date()
    const today = now.toISOString().split("T")[0]

    switch (periodFilter) {
      case "today":
        return txs.filter((t) => t.transaction_date === today)
      case "week": {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        return txs.filter((t) => t.transaction_date >= weekAgo)
      }
      case "month": {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
        return txs.filter((t) => t.transaction_date >= firstDay)
      }
      case "year": {
        const firstDayYear = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0]
        return txs.filter((t) => t.transaction_date >= firstDayYear)
      }
      default:
        return txs
    }
  }

  const periodTransactions = getFilteredByPeriod(transactions)
  const totalIncome = periodTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0)
  const totalExpense = periodTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0)
  const balance = totalIncome - totalExpense

  const filteredTransactions = periodTransactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || t.type === typeFilter
    return matchesSearch && matchesType
  })

  const openDialog = (type: "income" | "expense") => {
    setFormData({
      type,
      category: "",
      description: "",
      amount: 0,
      payment_method: "pix",
      transaction_date: new Date().toISOString().split("T")[0],
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.category || !formData.description || formData.amount <= 0) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from("financial_transactions")
        .insert({
          ...formData,
          reference_type: "manual",
          user_id: user?.id,
        })
        .select()
        .single()

      if (error) throw error

      setTransactions([data, ...transactions])
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
      alert("Erro ao salvar transação")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, referenceType: string | null) => {
    if (referenceType !== "manual") {
      alert("Não é possível excluir transações automáticas (vendas/compras)")
      return
    }

    if (!confirm("Deseja realmente excluir esta transação?")) return

    const supabase = createClient()
    const { error } = await supabase.from("financial_transactions").delete().eq("id", id)

    if (error) {
      alert("Erro ao excluir transação")
      return
    }

    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const periodLabels: Record<string, string> = {
    today: "Hoje",
    week: "Esta Semana",
    month: "Este Mês",
    year: "Este Ano",
    all: "Todo Período",
  }

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Entradas ({periodLabels[periodFilter]})</p>
                <p className="text-2xl font-bold text-green-500">
                  R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Saídas ({periodLabels[periodFilter]})</p>
                <p className="text-2xl font-bold text-red-500">
                  R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Saldo ({periodLabels[periodFilter]})</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? "text-blue-500" : "text-red-500"}`}>
                  R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${balance >= 0 ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                <DollarSign className={`w-6 h-6 ${balance >= 0 ? "text-blue-500" : "text-red-500"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => openDialog("income")} className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none">
          <ArrowUpCircle className="w-4 h-4 mr-2" />
          Nova Entrada
        </Button>
        <Button onClick={() => openDialog("expense")} className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-none">
          <ArrowDownCircle className="w-4 h-4 mr-2" />
          Nova Saída
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por descrição ou categoria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1e3a5f] border-[#2d4a6f] text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-40 bg-[#1e3a5f] border-[#2d4a6f] text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
                <SelectItem value="all" className="text-white focus:bg-[#1e3a5f]">
                  Todos
                </SelectItem>
                <SelectItem value="income" className="text-white focus:bg-[#1e3a5f]">
                  Entradas
                </SelectItem>
                <SelectItem value="expense" className="text-white focus:bg-[#1e3a5f]">
                  Saídas
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full lg:w-40 bg-[#1e3a5f] border-[#2d4a6f] text-white">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
                <SelectItem value="today" className="text-white focus:bg-[#1e3a5f]">
                  Hoje
                </SelectItem>
                <SelectItem value="week" className="text-white focus:bg-[#1e3a5f]">
                  Esta Semana
                </SelectItem>
                <SelectItem value="month" className="text-white focus:bg-[#1e3a5f]">
                  Este Mês
                </SelectItem>
                <SelectItem value="year" className="text-white focus:bg-[#1e3a5f]">
                  Este Ano
                </SelectItem>
                <SelectItem value="all" className="text-white focus:bg-[#1e3a5f]">
                  Todo Período
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <CardTitle className="text-white">Movimentações ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma movimentação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 bg-[#1e3a5f]/50 rounded-lg hover:bg-[#1e3a5f]/70 transition-colors"
                >
                  <div
                    className={`p-2.5 rounded-lg ${transaction.type === "income" ? "bg-green-500/20" : "bg-red-500/20"}`}
                  >
                    {transaction.reference_type === "sale" ? (
                      <ShoppingCart
                        className={`w-5 h-5 ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}
                      />
                    ) : transaction.reference_type === "purchase" ? (
                      <Package
                        className={`w-5 h-5 ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}
                      />
                    ) : transaction.type === "income" ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{transaction.description}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>
                        {new Date(transaction.transaction_date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      {transaction.reference_type && (
                        <>
                          <span>•</span>
                          <span className="text-xs px-1.5 py-0.5 bg-[#0f2744] rounded">
                            {transaction.reference_type === "sale"
                              ? "Venda"
                              : transaction.reference_type === "purchase"
                                ? "Compra"
                                : "Manual"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p
                        className={`text-lg font-bold ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"} R${" "}
                        {Number(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      {transaction.payment_method && (
                        <p className="text-xs text-slate-500">
                          {paymentMethods.find((p) => p.value === transaction.payment_method)?.label ||
                            transaction.payment_method}
                        </p>
                      )}
                    </div>
                    {transaction.reference_type === "manual" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        onClick={() => handleDelete(transaction.id, transaction.reference_type)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0f2744] border-[#1e3a5f] text-white">
          <DialogHeader>
            <DialogTitle className={formData.type === "income" ? "text-green-500" : "text-red-500"}>
              {formData.type === "income" ? "Nova Entrada" : "Nova Saída"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Registre uma nova movimentação financeira manual
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-300">Categoria *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f2744] border-[#1e3a5f] max-h-60">
                  {(formData.type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white focus:bg-[#1e3a5f]">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Descrição *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                placeholder="Ex: Pagamento de fornecedor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
              <div>
                <Label className="text-slate-300">Data</Label>
                <Input
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Forma de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
              >
                <SelectTrigger className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value} className="text-white focus:bg-[#1e3a5f]">
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#2d4a6f]">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className={formData.type === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
