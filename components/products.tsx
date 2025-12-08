"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

const categories = [
  { id: "bombas", name: "Bombas Hidráulicas" },
  { id: "caixas", name: "Caixas de Direção" },
  { id: "cilindros", name: "Cilindros Hidráulicos" },
  { id: "reparos", name: "Kits de Reparo" },
]

const products = [
  {
    id: 1,
    category: "bombas",
    name: "Bomba Hidráulica ZF 7674 955",
    application: "Scania, Volvo, Mercedes-Benz",
    image: "/hydraulic-pump-truck-part-industrial.jpg",
    type: "Nova / Recondicionada",
  },
  {
    id: 2,
    category: "bombas",
    name: "Bomba Hidráulica ZF 7685 955",
    application: "Volvo FH, FM",
    image: "/hydraulic-steering-pump-heavy-truck.jpg",
    type: "Nova / Recondicionada",
  },
  {
    id: 3,
    category: "caixas",
    name: "Caixa de Direção ZF 8098",
    application: "Mercedes-Benz Axor, Actros",
    image: "/steering-gearbox-truck-industrial-part.jpg",
    type: "Recondicionada",
  },
  {
    id: 4,
    category: "caixas",
    name: "Caixa de Direção TRW TAS65",
    application: "Scania P, G, R Series",
    image: "/truck-steering-box-heavy-duty-part.jpg",
    type: "Nova / Recondicionada",
  },
  {
    id: 5,
    category: "cilindros",
    name: "Cilindro Auxiliar Direção",
    application: "Multi-aplicação",
    image: "/hydraulic-cylinder-truck-steering.jpg",
    type: "Novo",
  },
  {
    id: 6,
    category: "reparos",
    name: "Kit Reparo Bomba ZF",
    application: "Linha completa ZF",
    image: "/repair-kit-hydraulic-seals-orings.jpg",
    type: "Original",
  },
]

export function Products() {
  const [activeCategory, setActiveCategory] = useState("bombas")

  const filteredProducts = products.filter((p) => p.category === activeCategory)

  return (
    <section id="produtos" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">Catálogo</span>
            <h2 className="text-3xl lg:text-5xl font-bold mt-4">
              Nossos <span className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">Produtos</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl">
              Peças novas, recondicionadas e kits de reparo para as principais marcas do mercado.
            </p>
          </div>
          <Button asChild className="mt-6 lg:mt-0 w-fit gap-2 bg-gradient-to-r from-[#f97316] to-[#fbbf24] text-primary-foreground hover:opacity-90 transition-opacity">
            <Link href="/catalogo">
              Ver Catálogo Completo
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300"
            >
              <div className="aspect-square bg-secondary/50 p-8 flex items-center justify-center">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <span className="text-xs text-primary font-medium">{product.type}</span>
                <h3 className="text-lg font-semibold mt-1 text-card-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Aplicação: {product.application}</p>
                <Button className="w-full mt-4 bg-gradient-to-r from-[#f97316] to-[#fbbf24] text-primary-foreground hover:opacity-90 transition-opacity">
                  Solicitar Orçamento
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
