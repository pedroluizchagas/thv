import { createClient } from "@/lib/supabase/server"
import { EstoqueClient } from "@/components/sistema/estoque/estoque-client"

async function getData() {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*, category:categories(*)").order("name"),
    supabase.from("categories").select("*").order("name"),
  ])

  return {
    products: products || [],
    categories: categories || [],
  }
}

export default async function EstoquePage() {
  const { products, categories } = await getData()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Estoque de Peças</h2>
        <p className="text-slate-400">Gerencie o cadastro e estoque de produtos</p>
      </div>

      <EstoqueClient initialProducts={products} categories={categories} />
    </div>
  )
}
