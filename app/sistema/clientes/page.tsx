import { createClient } from "@/lib/supabase/server"
import { ClientesClient } from "@/components/sistema/clientes/clientes-client"

async function getClientes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("customers").select("*").order("name")

  if (error) {
    console.error("Error fetching customers:", error)
    return []
  }

  return data || []
}

export default async function ClientesPage() {
  const clientes = await getClientes()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Clientes</h2>
        <p className="text-slate-400">Gerencie o cadastro de clientes</p>
      </div>

      <ClientesClient initialClientes={clientes} />
    </div>
  )
}
