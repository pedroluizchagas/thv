import { createClient } from "@/lib/supabase/server"
import { OrcamentosClient } from "@/components/sistema/orcamentos/orcamentos-client"

async function getQuoteRequests() {
  const supabase = await createClient()

  const { data: quotes, error } = await supabase
    .from("quote_requests")
    .select("*, product:products(*)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching quotes:", error)
    return []
  }

  return quotes || []
}

export default async function OrcamentosPage() {
  const quotes = await getQuoteRequests()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Solicitações de Orçamento</h2>
        <p className="text-slate-400">Gerencie as solicitações recebidas pela landing page</p>
      </div>

      <OrcamentosClient initialQuotes={quotes} />
    </div>
  )
}
