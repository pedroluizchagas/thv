import { createClient } from "@/lib/supabase/server"
import { PDVClient } from "@/components/sistema/pdv/pdv-client"

async function getData() {
  const supabase = await createClient()

  const [{ data: products }, { data: customers }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).gt("stock_quantity", 0).order("name"),
    supabase.from("customers").select("*").order("name"),
    supabase.from("categories").select("*").order("name"),
  ])

  return {
    products: products || [],
    customers: customers || [],
    categories: categories || [],
  }
}

export default async function PDVPage() {
  const { products, customers, categories } = await getData()

  return <PDVClient initialProducts={products} initialCustomers={customers} categories={categories} />
}
