"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, Banknote, Smartphone, Check } from "lucide-react"
import type { Product, Customer, Category, CartItem } from "@/lib/types"

const paymentMethods = [
  { value: "cash", label: "Dinheiro", icon: Banknote },
  { value: "credit", label: "Crédito", icon: CreditCard },
  { value: "debit", label: "Débito", icon: CreditCard },
  { value: "pix", label: "PIX", icon: Smartphone },
  { value: "transfer", label: "Transferência", icon: Smartphone },
  { value: "boleto", label: "Boleto", icon: CreditCard },
]

interface PDVClientProps {
  initialProducts: Product[]
  initialCustomers: Customer[]
  categories: Category[]
}

export function PDVClient({ initialProducts, initialCustomers, categories }: PDVClientProps) {
  const [products] = useState<Product[]>(initialProducts)
  const [customers] = useState<Customer[]>(initialCustomers)
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [discount, setDiscount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [saleCompleted, setSaleCompleted] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.code.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id)
    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        setCart(cart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
      }
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            if (newQty <= 0) return null
            if (newQty > item.product.stock_quantity) return item
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter(Boolean) as CartItem[],
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const subtotal = cart.reduce((acc, item) => acc + item.product.sale_price * item.quantity, 0)
  const total = subtotal - discount

  const handleCheckout = async () => {
    if (cart.length === 0) return

    setIsProcessing(true)
    const supabase = createClient()

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          customer_id: selectedCustomer || null,
          user_id: user.id,
          subtotal,
          discount,
          total,
          payment_method: paymentMethod,
          status: "completed",
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items
      const saleItems = cart.map((item) => ({
        sale_id: sale.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.sale_price,
        total_price: item.product.sale_price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)

      if (itemsError) throw itemsError

      setSaleCompleted(true)
    } catch (error) {
      console.error("Erro ao finalizar venda:", error)
      alert("Erro ao finalizar venda. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetSale = () => {
    setCart([])
    setSelectedCustomer("")
    setDiscount(0)
    setPaymentMethod("cash")
    setSaleCompleted(false)
    setIsCheckoutOpen(false)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white">PDV - Ponto de Vendas</h2>
          <p className="text-slate-400">Selecione os produtos para adicionar ao carrinho</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar produto por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#1e3a5f] border-[#2d4a6f] text-white placeholder:text-slate-500"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-[#1e3a5f] border-[#2d4a6f] text-white">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
              <SelectItem value="all" className="text-white focus:bg-[#1e3a5f]">
                Todas
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-[#1e3a5f]">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="bg-[#0f2744] border-[#1e3a5f] hover:border-[#f97316]/50 cursor-pointer transition-all"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 mb-1">{product.code}</p>
                  <p className="font-medium text-white text-sm line-clamp-2 mb-2">{product.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[#f97316] font-bold">
                      R$ {product.sale_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-xs text-slate-400">Est: {product.stock_quantity}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <Card className="w-full lg:w-96 bg-[#0f2744] border-[#1e3a5f] flex flex-col">
        <CardHeader className="border-b border-[#1e3a5f]">
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Carrinho ({cart.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Customer Select */}
          <div className="mb-4">
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="bg-[#1e3a5f] border-[#2d4a6f] text-white">
                <User className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Selecionar cliente (opcional)" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f2744] border-[#1e3a5f]">
                <SelectItem value="none" className="text-white focus:bg-[#1e3a5f]">
                  Sem cliente
                </SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id} className="text-white focus:bg-[#1e3a5f]">
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto space-y-2 mb-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Carrinho vazio</p>
                <p className="text-sm">Clique em um produto para adicionar</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="bg-[#1e3a5f]/50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                      <p className="text-xs text-slate-400">
                        R$ {item.product.sale_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} cada
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 border-[#2d4a6f] hover:bg-[#1e3a5f] bg-transparent"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 border-[#2d4a6f] hover:bg-[#1e3a5f] bg-transparent"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-[#f97316] font-bold">
                      R${" "}
                      {(item.product.sale_price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-[#1e3a5f] pt-4 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Desconto</span>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(subtotal, Number(e.target.value))))}
                className="w-28 h-8 text-right bg-[#1e3a5f] border-[#2d4a6f] text-white"
              />
            </div>
            <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-[#1e3a5f]">
              <span>Total</span>
              <span className="text-[#f97316]">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <Button
            className="w-full mt-4 bg-[#f97316] hover:bg-[#ea580c] text-white"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
          >
            Finalizar Venda
          </Button>
        </CardContent>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-[#0f2744] border-[#1e3a5f] text-white">
          {saleCompleted ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-500">
                  <Check className="w-6 h-6" />
                  Venda Finalizada!
                </DialogTitle>
                <DialogDescription className="text-slate-400">A venda foi registrada com sucesso.</DialogDescription>
              </DialogHeader>
              <div className="py-6 text-center">
                <p className="text-3xl font-bold text-[#f97316] mb-2">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-slate-400">O estoque foi atualizado automaticamente</p>
              </div>
              <DialogFooter>
                <Button onClick={resetSale} className="w-full bg-[#f97316] hover:bg-[#ea580c]">
                  Nova Venda
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Finalizar Venda</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Selecione a forma de pagamento para concluir
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.value}
                      variant={paymentMethod === method.value ? "default" : "outline"}
                      className={
                        paymentMethod === method.value
                          ? "bg-[#f97316] hover:bg-[#ea580c] border-[#f97316]"
                          : "border-[#2d4a6f] hover:bg-[#1e3a5f]"
                      }
                      onClick={() => setPaymentMethod(method.value)}
                    >
                      <method.icon className="w-4 h-4 mr-1" />
                      {method.label}
                    </Button>
                  ))}
                </div>

                <div className="bg-[#1e3a5f]/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Itens</span>
                    <span>{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Desconto</span>
                      <span>- R$ {discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t border-[#2d4a6f]">
                    <span>Total</span>
                    <span className="text-[#f97316]">
                      R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="border-[#2d4a6f]">
                  Cancelar
                </Button>
                <Button onClick={handleCheckout} disabled={isProcessing} className="bg-[#f97316] hover:bg-[#ea580c]">
                  {isProcessing ? "Processando..." : "Confirmar Venda"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
