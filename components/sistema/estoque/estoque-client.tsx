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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Filter,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import type { Product, Category } from "@/lib/types"

interface EstoqueClientProps {
  initialProducts: (Product & { category?: Category })[]
  categories: Category[]
}

export function EstoqueClient({ initialProducts, categories }: EstoqueClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null)
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0)
  const [adjustNotes, setAdjustNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null])
  const [imagePreviews, setImagePreviews] = useState<string[]>(["", "", ""])
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    category_id: "",
    cost_price: 0,
    sale_price: 0,
    stock_quantity: 0,
    min_stock: 5,
    unit: "un",
    brand: "",
    application: "",
    photo1_url: "",
    photo2_url: "",
    photo3_url: "",
    is_active: true,
  })

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.code.toLowerCase().includes(search.toLowerCase()) ||
      product.brand?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.stock_quantity <= product.min_stock) ||
      (stockFilter === "out" && product.stock_quantity === 0) ||
      (stockFilter === "ok" && product.stock_quantity > product.min_stock)

    return matchesSearch && matchesCategory && matchesStock
  })

  const lowStockCount = products.filter((p) => p.stock_quantity <= p.min_stock && p.stock_quantity > 0).length
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length
  const totalValue = products.reduce((acc, p) => acc + p.cost_price * p.stock_quantity, 0)

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        code: product.code,
        name: product.name,
        description: product.description || "",
        category_id: product.category_id || "",
        cost_price: product.cost_price,
        sale_price: product.sale_price,
        stock_quantity: product.stock_quantity,
        min_stock: product.min_stock,
        unit: product.unit,
        brand: product.brand || "",
        application: product.application || "",
        photo1_url: product.photo1_url || "",
        photo2_url: product.photo2_url || "",
        photo3_url: product.photo3_url || "",
        is_active: product.is_active,
      })
      setImageFiles([null, null, null])
      setImagePreviews([
        product.photo1_url || "",
        product.photo2_url || "",
        product.photo3_url || "",
      ])
    } else {
      setEditingProduct(null)
      setFormData({
        code: "",
        name: "",
        description: "",
        category_id: "",
        cost_price: 0,
        sale_price: 0,
        stock_quantity: 0,
        min_stock: 5,
        unit: "un",
        brand: "",
        application: "",
        photo1_url: "",
        photo2_url: "",
        photo3_url: "",
        is_active: true,
      })
      setImageFiles([null, null, null])
      setImagePreviews(["", "", ""])
    }
    setIsDialogOpen(true)
  }

  const openAdjustDialog = (product: Product) => {
    setAdjustingProduct(product)
    setAdjustQuantity(0)
    setAdjustNotes("")
    setIsAdjustDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim() || formData.sale_price <= 0) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      if (editingProduct) {
        const uploadResults: { [k: string]: string } = {}
        for (let i = 0; i < 3; i++) {
          const file = imageFiles[i]
          if (file && editingProduct.id) {
            const ext = file.name.split(".").pop() || "jpg"
            const path = `products/${editingProduct.id}/photo${i + 1}-${Date.now()}.${ext}`
            const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, {
              upsert: true,
            })
            if (upErr) throw upErr
            const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path)
            if (pub?.publicUrl) {
              uploadResults[`photo${i + 1}_url`] = pub.publicUrl
            }
          }
        }

        const { error } = await supabase
          .from("products")
          .update({ ...formData, ...uploadResults, updated_at: new Date().toISOString() })
          .eq("id", editingProduct.id)

        if (error) throw error

        const category = categories.find((c) => c.id === formData.category_id)
        setProducts(
          products.map((p) =>
            p.id === editingProduct.id ? { ...p, ...formData, ...uploadResults, category } : p,
          ),
        )
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert({ ...formData })
          .select("*")
          .single()

        if (error) throw error

        const uploadResults: { [k: string]: string } = {}
        for (let i = 0; i < 3; i++) {
          const file = imageFiles[i]
          if (file) {
            const ext = file.name.split(".").pop() || "jpg"
            const path = `products/${data.id}/photo${i + 1}-${Date.now()}.${ext}`
            const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, {
              upsert: true,
            })
            if (upErr) throw upErr
            const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path)
            if (pub?.publicUrl) {
              uploadResults[`photo${i + 1}_url`] = pub.publicUrl
            }
          }
        }

        let newProduct = data
        if (Object.keys(uploadResults).length > 0) {
          const { data: updated, error: updErr } = await supabase
            .from("products")
            .update({ ...uploadResults, updated_at: new Date().toISOString() })
            .eq("id", data.id)
            .select("*, category:categories(*)")
            .single()
          if (updErr) throw updErr
          newProduct = updated
        } else {
          const { data: withCat } = await supabase
            .from("products")
            .select("*, category:categories(*)")
            .eq("id", data.id)
            .single()
          newProduct = withCat || data
        }
        setProducts([...products, newProduct])
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      alert("Erro ao salvar produto")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdjustStock = async () => {
    if (!adjustingProduct || adjustQuantity === 0) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const newQuantity = adjustingProduct.stock_quantity + adjustQuantity

      // Update product stock
      const { error: productError } = await supabase
        .from("products")
        .update({ stock_quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", adjustingProduct.id)

      if (productError) throw productError

      // Create stock movement
      const { error: movementError } = await supabase.from("stock_movements").insert({
        product_id: adjustingProduct.id,
        type: "adjustment",
        quantity: adjustQuantity,
        reference_type: "adjustment",
        notes: adjustNotes,
        user_id: user?.id,
      })

      if (movementError) throw movementError

      setProducts(products.map((p) => (p.id === adjustingProduct.id ? { ...p, stock_quantity: newQuantity } : p)))

      setIsAdjustDialogOpen(false)
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error)
      alert("Erro ao ajustar estoque")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este produto?")) return

    const supabase = createClient()
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      alert("Erro ao excluir produto. Verifique se não há vendas vinculadas.")
      return
    }

    setProducts(products.filter((p) => p.id !== id))
  }

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total de Produtos</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-500">{lowStockCount}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-500">{outOfStockCount}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <Package className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Valor em Estoque</p>
                <p className="text-2xl font-bold text-green-500">
                  R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, código ou marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1e3a5f] border-[#2d4a6f] text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-[#1e3a5f] border-[#2d4a6f] text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
                <SelectItem value="all" className="text-white focus:bg-[#1e3a5f]">
                  Todas Categorias
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-[#1e3a5f]">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-[#1e3a5f] border-[#2d4a6f] text-white">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estoque" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
                <SelectItem value="all" className="text-white focus:bg-[#1e3a5f]">
                  Todos
                </SelectItem>
                <SelectItem value="ok" className="text-white focus:bg-[#1e3a5f]">
                  Estoque OK
                </SelectItem>
                <SelectItem value="low" className="text-white focus:bg-[#1e3a5f]">
                  Estoque Baixo
                </SelectItem>
                <SelectItem value="out" className="text-white focus:bg-[#1e3a5f]">
                  Sem Estoque
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => openDialog()} className="bg-[#f97316] hover:bg-[#ea580c]">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card className="bg-[#0f2744] border-[#1e3a5f]">
        <CardHeader>
          <CardTitle className="text-white">Produtos ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e3a5f]">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Código</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Produto</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Categoria</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Custo</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Venda</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Estoque</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Status</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-[#1e3a5f]/50 hover:bg-[#1e3a5f]/30">
                      <td className="py-3 px-4 text-slate-300 font-mono text-sm">{product.code}</td>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">{product.name}</p>
                        {product.brand && <p className="text-xs text-slate-500">{product.brand}</p>}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{product.category?.name || "-"}</td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        R$ {product.cost_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-[#f97316] font-medium">
                        R$ {product.sale_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold ${
                            product.stock_quantity === 0
                              ? "text-red-500"
                              : product.stock_quantity <= product.min_stock
                                ? "text-yellow-500"
                                : "text-green-500"
                          }`}
                        >
                          {product.stock_quantity}
                        </span>
                        <span className="text-slate-500 text-xs ml-1">{product.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs ${product.is_active ? "bg-green-500/20 text-green-500" : "bg-slate-500/20 text-slate-500"}`}
                        >
                          {product.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                            onClick={() => openAdjustDialog(product)}
                            title="Ajustar Estoque"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#1e3a5f]"
                            onClick={() => openDialog(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0f2744] border-[#1e3a5f] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingProduct ? "Atualize os dados do produto" : "Preencha os dados do novo produto"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Código *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                  placeholder="EX: BH-001"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-slate-300">Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-[#1e3a5f]">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Marca</Label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f] resize-none"
                rows={2}
              />
            </div>

            <div>
              <Label className="text-slate-300">Aplicação</Label>
              <Input
                value={formData.application}
                onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                placeholder="Ex: Scania R 440, Volvo FH"
              />
            </div>

            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <Label className="text-slate-300">Preço Custo</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
              <div>
                <Label className="text-slate-300">Preço Venda *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: Number(e.target.value) })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
              <div>
                <Label className="text-slate-300">Qtd Estoque</Label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
              <div>
                <Label className="text-slate-300">Estoque Mín.</Label>
                <Input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                  className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Unidade</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
                    <SelectItem value="un" className="text-white focus:bg-[#1e3a5f]">
                      Unidade (un)
                    </SelectItem>
                    <SelectItem value="pc" className="text-white focus:bg-[#1e3a5f]">
                      Peça (pc)
                    </SelectItem>
                    <SelectItem value="cx" className="text-white focus:bg-[#1e3a5f]">
                      Caixa (cx)
                    </SelectItem>
                    <SelectItem value="kg" className="text-white focus:bg-[#1e3a5f]">
                      Quilograma (kg)
                    </SelectItem>
                    <SelectItem value="lt" className="text-white focus:bg-[#1e3a5f]">
                      Litro (lt)
                    </SelectItem>
                    <SelectItem value="mt" className="text-white focus:bg-[#1e3a5f]">
                      Metro (mt)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label className="text-slate-300">Produto Ativo</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Fotos do Produto (até 3)</Label>
              <div className="grid sm:grid-cols-3 gap-4 mt-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-square bg-[#1e3a5f] border border-[#2d4a6f] rounded flex items-center justify-center overflow-hidden">
                      {imagePreviews[i] ? (
                        <img src={imagePreviews[i]} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-400 text-sm">Sem foto</div>
                      )}
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      className="bg-[#1e3a5f] border-[#2d4a6f]"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        const nextFiles = [...imageFiles]
                        nextFiles[i] = file
                        setImageFiles(nextFiles)
                        const nextPrev = [...imagePreviews]
                        nextPrev[i] = file ? URL.createObjectURL(file) : imagePreviews[i]
                        setImagePreviews(nextPrev)
                      }}
                    />
                  </div>
                ))}
              </div>
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

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="bg-[#0f2744] border-[#1e3a5f] text-white">
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
            <DialogDescription className="text-slate-400">
              {adjustingProduct?.name} - Estoque atual: {adjustingProduct?.stock_quantity} {adjustingProduct?.unit}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-300">Quantidade (+ para entrada, - para saída)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 bg-transparent"
                  onClick={() => setAdjustQuantity(adjustQuantity - 1)}
                >
                  <TrendingDown className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="text-center bg-[#1e3a5f] border-[#2d4a6f] text-xl font-bold"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/20 bg-transparent"
                  onClick={() => setAdjustQuantity(adjustQuantity + 1)}
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-400 mt-2 text-center">
                Novo estoque: {(adjustingProduct?.stock_quantity || 0) + adjustQuantity} {adjustingProduct?.unit}
              </p>
            </div>

            <div>
              <Label className="text-slate-300">Motivo do ajuste</Label>
              <Textarea
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                className="mt-1.5 bg-[#1e3a5f] border-[#2d4a6f] resize-none"
                rows={2}
                placeholder="Ex: Correção de inventário, perda, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)} className="border-[#2d4a6f]">
              Cancelar
            </Button>
            <Button
              onClick={handleAdjustStock}
              disabled={isLoading || adjustQuantity === 0}
              className="bg-[#f97316] hover:bg-[#ea580c]"
            >
              {isLoading ? "Ajustando..." : "Confirmar Ajuste"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
