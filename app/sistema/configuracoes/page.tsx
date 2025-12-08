import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Building2, Shield } from "lucide-react"

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Configurações</h2>
        <p className="text-slate-400">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#f97316]" />
              Dados do Usuário
            </CardTitle>
            <CardDescription className="text-slate-400">Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">E-mail</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">ID do Usuário</p>
              <p className="text-white font-mono text-sm">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Último Acesso</p>
              <p className="text-white">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f2744] border-[#1e3a5f]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#f97316]" />
              Dados da Empresa
            </CardTitle>
            <CardDescription className="text-slate-400">Informações da THV Hidraulic Parts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Razão Social</p>
              <p className="text-white font-medium">THV Hidraulic Parts</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Segmento</p>
              <p className="text-white">Peças Hidráulicas para Linha Pesada</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Localização</p>
              <p className="text-white">Divinópolis - MG</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f2744] border-[#1e3a5f] md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#f97316]" />
              Segurança
            </CardTitle>
            <CardDescription className="text-slate-400">Configurações de segurança da conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-[#1e3a5f]/50 rounded-lg p-4">
              <p className="text-slate-300">
                Para alterar sua senha ou configurações de segurança, entre em contato com o administrador do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
