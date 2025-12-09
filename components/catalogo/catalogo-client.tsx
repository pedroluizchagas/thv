"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Search, Package, ChevronLeft, ChevronRight } from "lucide-react"
import type { Product, Category } from "@/lib/types"

interface CatalogoClientProps {
  initialProducts: (Product & { category?: Category })[]
  categories: Category[]
}

export function CatalogoClient({ initialProducts, categories }: CatalogoClientProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const itemsPerPage = 12

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return initialProducts.filter((p) => {
      const hay = `${p.name} ${p.code} ${p.brand || ""} ${p.application || ""}`.toLowerCase()
      const matchesSearch = term === "" || hay.includes(term)
      const matchesCategory = categoryFilter === "all" || p.category_id === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [initialProducts, search, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * itemsPerPage
  const pageEnd = pageStart + itemsPerPage
  const displayedProducts = filteredProducts.slice(pageStart, pageEnd)

  const pagesToShow = useMemo(() => {
    const total = totalPages
    const current = currentPage
    const list: (number | "ellipsis-start" | "ellipsis-end")[] = []
    if (total <= 7) {
      for (let i = 1; i <= total; i++) list.push(i)
      return list
    }
    list.push(1)
    if (current > 3) list.push("ellipsis-start")
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) list.push(i)
    if (current < total - 2) list.push("ellipsis-end")
    list.push(total)
    return list
  }, [totalPages, currentPage])

  const getImageSrc = (p: Product & { category?: Category }) => {
    if (p.photo1_url) return p.photo1_url
    const s = p.category?.slug?.toLowerCase() || ""
    if (s.includes("bomba")) return "/hydraulic-pump-truck-part-industrial.jpg"
    if (s.includes("caixa")) return "/steering-gearbox-truck-industrial-part.jpg"
    if (s.includes("cilindro")) return "/hydraulic-cylinder-truck-steering.jpg"
    if (s.includes("reparo")) return "/repair-kit-hydraulic-seals-orings.jpg"
    return "/placeholder.svg"
  }

  function ProductImageCarousel({ product }: { product: Product & { category?: Category } }) {
    const images: string[] = [product.photo1_url || "", product.photo2_url || "", product.photo3_url || ""].filter(
      (u) => !!u,
    )
    const fallback = getImageSrc(product)
    const list = images.length > 0 ? images : [fallback]
    const [idx, setIdx] = useState(0)
    const prev = () => setIdx((i) => (i - 1 + list.length) % list.length)
    const next = () => setIdx((i) => (i + 1) % list.length)
    return (
      <div className="relative aspect-square bg-secondary/50 flex items-center justify-center">
        <img src={list[idx]} alt={product.name} className="w-full h-full object-contain" />
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/60 hover:bg-background text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/60 hover:bg-background text-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {list.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${i === idx ? "bg-primary" : "bg-muted-foreground/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código, marca ou aplicação..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between mt-6">
        <h2 className="text-lg font-semibold text-card-foreground">Produtos ({filteredProducts.length})</h2>
        {categoryFilter !== "all" && (
          <p className="text-sm text-muted-foreground">
            {categories.find((c) => c.id === categoryFilter)?.name}
          </p>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {displayedProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all"
            >
              <div className="overflow-hidden">
                <ProductImageCarousel product={product} />
              </div>
              <div className="p-6">
                <p className="text-xs text-muted-foreground">{product.code}</p>
                <h3 className="text-lg font-semibold mt-1 text-card-foreground">{product.name}</h3>
                {product.application && (
                  <p className="text-sm text-muted-foreground mt-1">Aplicação: {product.application}</p>
                )}
                {product.brand && <p className="text-sm text-muted-foreground mt-1">Marca: {product.brand}</p>}
                <Button className="w-full mt-4 bg-gradient-to-r from-[#f97316] to-[#fbbf24] text-primary-foreground hover:opacity-90">
                  <a
                    href={`https://wa.me/5537999220892?text=${encodeURIComponent(
                      `Olá! Gostaria de solicitar um orçamento para o produto ${product.name} (código: ${product.code}).`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Solicitar Orçamento
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredProducts.length > itemsPerPage && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setPage(Math.max(1, currentPage - 1))
                }}
              />
            </PaginationItem>
            {pagesToShow.map((item, idx) => (
              <PaginationItem key={`${item}-${idx}`}>
                {typeof item === "number" ? (
                  <PaginationLink
                    href="#"
                    isActive={item === currentPage}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(item)
                    }}
                  >
                    {item}
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setPage(Math.min(totalPages, currentPage + 1))
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
