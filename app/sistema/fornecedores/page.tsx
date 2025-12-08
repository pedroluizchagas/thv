import { createClient } from "@/lib/supabase/server"
import { FornecedoresClient } from "@/components/sistema/fornecedores/fornecedores-client"

async function getFornecedores() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("suppliers").select("*").order("name")

  if (error) {
    console.error("Error fetching suppliers:", error)
    return []
  }

  return data || []
}

export default async function FornecedoresPage() {
  const fornecedores = await getFornecedores()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Fornecedores</h2>
        <p className="text-slate-400">Gerencie o cadastro de fornecedores</p>
      </div>

      <FornecedoresClient initialFornecedores={fornecedores} />
    </div>
  )
}
