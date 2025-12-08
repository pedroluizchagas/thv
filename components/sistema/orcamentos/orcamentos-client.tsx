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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, MessageCircle, Mail, Phone, Calendar, Package, Filter } from "lucide-react"
import type { QuoteRequest } from "@/lib/types"

const statusOptions = [
  { value: "pending", label: "Pendente", color: "bg-yellow-500/20 text-yellow-500" },
  { value: "contacted", label: "Contatado", color: "bg-blue-500/20 text-blue-500" },
  { value: "quoted", label: "Orçado", color: "bg-purple-500/20 text-purple-500" },
  { value: "converted", label: "Convertido", color: "bg-green-500/20 text-green-500" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500/20 text-red-500" },
]

interface OrcamentosClientProps {
  initialQuotes: QuoteRequest[]
}

export function OrcamentosClient({ initialQuotes }: OrcamentosClientProps) {
  const [quotes, setQuotes] = useState<QuoteRequest[]>(initialQuotes)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [newStatus, setNewStatus] = useState("")

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.name.toLowerCase().includes(search.toLowerCase()) ||
      quote.email.toLowerCase().includes(search.toLowerCase()) ||
      quote.phone?.includes(search) ||
      quote.product_name?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "all" || quote.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleOpenDetails = (quote: QuoteRequest) => {
    setSelectedQuote(quote)
    setNotes(quote.notes || "")
    setNewStatus(quote.status)
    setIsDialogOpen(true)
  }

  const handleUpdateQuote = async () => {
    if (!selectedQuote) return

    const supabase = createClient()

    const { error } = await supabase
      .from("quote_requests")
      .update({
        status: newStatus,
        notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedQuote.id)

    if (error) {
      alert("Erro ao atualizar orçamento")
      return
    }

    setQuotes(
      quotes.map((q) => (q.id === selectedQuote.id ? { ...q, status: newStatus as QuoteRequest["status"], notes } : q)),
    )
    setIsDialogOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((s) => s.value === status)
    return option ? (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${option.color}`}>{option.label}</span>
    ) : null
  }

  const pendingCount = quotes.filter((q) => q.status === "pending").length
  const contactedCount = quotes.filter((q) => q.status === "contacted").length
  const quotedCount = quotes.filter((q) => q.status === "quoted").length
  const convertedCount = quotes.filter((q) => q.status === "converted").length

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Filter className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Contatados</p>
                <p className="text-2xl font-bold text-blue-500">{contactedCount}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Phone className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Orçados</p>
                <p className="text-2xl font-bold text-purple-500">{quotedCount}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Mail className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Convertidos</p>
                <p className="text-2xl font-bold text-green-500">{convertedCount}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Package className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, email, telefone ou produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1e3a5f] border-[#2d4a6f] text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-[#1e3a5f] border-[#2d4a6f] text-white">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
                <SelectItem value="all" className="text-white focus:bg-[#1e3a5f]">
                  Todos
                </SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-white focus:bg-[#1e3a5f]">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <CardTitle className="text-white">Solicitações ({filteredQuotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#1e3a5f]/50 rounded-lg gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-medium text-white">{quote.name}</p>
                      {getStatusBadge(quote.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {quote.email}
                      </span>
                      {quote.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {quote.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(quote.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {quote.product_name && (
                      <p className="text-sm text-[#f97316] mt-2 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        {quote.product_name}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetails(quote)}
                    className="border-[#2d4a6f] text-slate-300 hover:bg-[#1e3a5f] hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Detalhes
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0f2744] border-[#1e3a5f] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription className="text-slate-400">
              Visualize e gerencie esta solicitação de orçamento
            </DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Nome</p>
                  <p className="font-medium">{selectedQuote.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">E-mail</p>
                  <p className="font-medium">{selectedQuote.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Telefone</p>
                  <p className="font-medium">{selectedQuote.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Data</p>
                  <p className="font-medium">
                    {new Date(selectedQuote.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {selectedQuote.product_name && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Produto de Interesse</p>
                  <p className="font-medium text-[#f97316]">{selectedQuote.product_name}</p>
                </div>
              )}

              {selectedQuote.message && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Mensagem</p>
                  <p className="bg-[#1e3a5f]/50 p-3 rounded-lg">{selectedQuote.message}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-400 mb-2">Status</p>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-[#1e3a5f] border-[#2d4a6f]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value} className="text-white focus:bg-[#1e3a5f]">
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">Observações Internas</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre este orçamento..."
                  className="bg-[#1e3a5f] border-[#2d4a6f] resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-green-600 text-green-500 hover:bg-green-600 hover:text-white bg-transparent"
                  onClick={() => window.open(`https://wa.me/55${selectedQuote.phone?.replace(/\D/g, "")}`, "_blank")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white bg-transparent"
                  onClick={() => window.open(`mailto:${selectedQuote.email}`, "_blank")}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  E-mail
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#2d4a6f]">
              Cancelar
            </Button>
            <Button onClick={handleUpdateQuote} className="bg-[#f97316] hover:bg-[#ea580c]">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
