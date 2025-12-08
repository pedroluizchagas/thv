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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2, Users, Phone, Mail, MapPin } from "lucide-react"
import type { Customer } from "@/lib/types"

interface ClientesClientProps {
  initialClientes: Customer[]
}

export function ClientesClient({ initialClientes }: ClientesClientProps) {
  const [clientes, setClientes] = useState<Customer[]>(initialClientes)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    address: "",
    city: "",
    state: "",
    notes: "",
  })

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.name.toLowerCase().includes(search.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(search.toLowerCase()) ||
      cliente.phone?.includes(search) ||
      cliente.document?.includes(search),
  )

  const openDialog = (cliente?: Customer) => {
    if (cliente) {
      setEditingCliente(cliente)
      setFormData({
        name: cliente.name,
        email: cliente.email || "",
        phone: cliente.phone || "",
        document: cliente.document || "",
        address: cliente.address || "",
        city: cliente.city || "",
        state: cliente.state || "",
        notes: cliente.notes || "",
      })
    } else {
      setEditingCliente(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        document: "",
        address: "",
        city: "",
        state: "",
        notes: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      if (editingCliente) {
        const { error } = await supabase
          .from("customers")
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq("id", editingCliente.id)

        if (error) throw error

        setClientes(clientes.map((c) => (c.id === editingCliente.id ? { ...c, ...formData } : c)))
      } else {
        const { data, error } = await supabase.from("customers").insert(formData).select().single()

        if (error) throw error

        setClientes([...clientes, data])
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      alert("Erro ao salvar cliente")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este cliente?")) return

    const supabase = createClient()
    const { error } = await supabase.from("customers").delete().eq("id", id)

    if (error) {
      alert("Erro ao excluir cliente")
      return
    }

    setClientes(clientes.filter((c) => c.id !== id))
  }

  return (
    <>
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, email, telefone ou documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1e3a5f] border-[#2d4a6f] text-white placeholder:text-slate-500"
              />
            </div>
            <Button onClick={() => openDialog()} className="bg-[#f97316] hover:bg-[#ea580c]">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <CardTitle className="text-white">Clientes ({filteredClientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#1e3a5f]/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white">{cliente.name}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-400">
                      {cliente.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {cliente.email}
                        </span>
                      )}
                      {cliente.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {cliente.phone}
                        </span>
                      )}
                      {cliente.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {cliente.city}
                          {cliente.state && ` - ${cliente.state}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(cliente)}
                      className="border-[#2d4a6f] hover:bg-[#1e3a5f]"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cliente.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0f2744] border-[#1e3a5f] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingCliente ? "Atualize os dados do cliente" : "Preencha os dados do novo cliente"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
              <div>
                <Label className="text-slate-300">CPF/CNPJ</Label>
                <Input
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
              <div>
                <Label className="text-slate-300">Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Endereço</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Cidade</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
              <div>
                <Label className="text-slate-300">Estado</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                  maxLength={2}
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f] resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#2d4a6f]">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="bg-[#f97316] hover:bg-[#ea580c]">
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
