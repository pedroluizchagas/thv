import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { CatalogoClient } from "@/components/catalogo/catalogo-client"

export default async function CatalogoPage() {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .order("name"),
    supabase.from("categories").select("*").order("name"),
  ])

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-24 pb-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">Catálogo</span>
            <h1 className="text-3xl lg:text-5xl font-bold mt-4">
              Catálogo <span className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">Completo</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl">
              Explore nossa linha completa de produtos novos e recondicionados.
            </p>
          </div>
          <CatalogoClient initialProducts={products || []} categories={categories || []} />
        </div>
      </section>
      <Footer />
    </main>
  )
}

