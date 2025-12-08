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
import { Search, Plus, Edit, Trash2, Truck, Phone, Mail, MapPin } from "lucide-react"
import type { Supplier } from "@/lib/types"

interface FornecedoresClientProps {
  initialFornecedores: Supplier[]
}

export function FornecedoresClient({ initialFornecedores }: FornecedoresClientProps) {
  const [fornecedores, setFornecedores] = useState<Supplier[]>(initialFornecedores)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<Supplier | null>(null)
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

  const filteredFornecedores = fornecedores.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email?.toLowerCase().includes(search.toLowerCase()) ||
      f.phone?.includes(search),
  )

  const openDialog = (fornecedor?: Supplier) => {
    if (fornecedor) {
      setEditingFornecedor(fornecedor)
      setFormData({
        name: fornecedor.name,
        email: fornecedor.email || "",
        phone: fornecedor.phone || "",
        document: fornecedor.document || "",
        address: fornecedor.address || "",
        city: fornecedor.city || "",
        state: fornecedor.state || "",
        notes: fornecedor.notes || "",
      })
    } else {
      setEditingFornecedor(null)
      setFormData({ name: "", email: "", phone: "", document: "", address: "", city: "", state: "", notes: "" })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      if (editingFornecedor) {
        const { error } = await supabase
          .from("suppliers")
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq("id", editingFornecedor.id)

        if (error) throw error
        setFornecedores(fornecedores.map((f) => (f.id === editingFornecedor.id ? { ...f, ...formData } : f)))
      } else {
        const { data, error } = await supabase.from("suppliers").insert(formData).select().single()
        if (error) throw error
        setFornecedores([...fornecedores, data])
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error)
      alert("Erro ao salvar fornecedor")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este fornecedor?")) return

    const supabase = createClient()
    const { error } = await supabase.from("suppliers").delete().eq("id", id)

    if (error) {
      alert("Erro ao excluir fornecedor")
      return
    }
    setFornecedores(fornecedores.filter((f) => f.id !== id))
  }

  return (
    <>
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1e3a5f] border-[#2d4a6f] text-white placeholder:text-slate-500"
              />
            </div>
            <Button onClick={() => openDialog()} className="bg-[#f97316] hover:bg-[#ea580c]">
              <Plus className="w-4 h-4 mr-2" />
              Novo Fornecedor
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <CardTitle className="text-white">Fornecedores ({filteredFornecedores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFornecedores.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum fornecedor encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFornecedores.map((fornecedor) => (
                <div
                  key={fornecedor.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#1e3a5f]/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white">{fornecedor.name}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-400">
                      {fornecedor.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {fornecedor.email}
                        </span>
                      )}
                      {fornecedor.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {fornecedor.phone}
                        </span>
                      )}
                      {fornecedor.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {fornecedor.city}
                          {fornecedor.state && ` - ${fornecedor.state}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(fornecedor)}
                      className="border-[#2d4a6f] hover:bg-[#1e3a5f]"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(fornecedor.id)}
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
            <DialogTitle>{editingFornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingFornecedor ? "Atualize os dados do fornecedor" : "Preencha os dados do novo fornecedor"}
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
                <Label className="text-slate-300">CNPJ</Label>
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
