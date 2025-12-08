// Script para criar usuário administrador no Supabase Auth
// Execute este script uma vez para criar o usuário

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  const email = "thvhidraulicparts@gmail.com"
  const password = "MichaelJackson"
  const name = "THV Hidraulic Parts"

  console.log("Criando usuário administrador...")

  // Criar usuário no Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
    },
  })

  if (authError) {
    console.error("Erro ao criar usuário:", authError.message)
    return
  }

  console.log("Usuário criado com sucesso!")
  console.log("ID:", authData.user.id)

  // Criar perfil na tabela profiles
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    name,
    email,
    role: "admin",
  })

  if (profileError) {
    console.error("Erro ao criar perfil:", profileError.message)
    return
  }

  console.log("Perfil admin criado com sucesso!")
  console.log("\n--- Credenciais de Acesso ---")
  console.log("Email:", email)
  console.log("Senha:", password)
  console.log("-----------------------------")
}

createAdminUser()
