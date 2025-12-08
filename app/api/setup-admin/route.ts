import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Variáveis de ambiente do Supabase não configuradas",
        },
        { status: 500 },
      )
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const email = "thvhidraulicparts@gmail.com"
    const password = "MichaelJackson"

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: "THV Admin",
        role: "admin",
      },
    })

    if (error) {
      const msg = error.message || "Erro ao criar usuário"
      const lower = msg.toLowerCase()
      if (lower.includes("already") || lower.includes("registered")) {
        return NextResponse.json({ success: true, message: "Usuário já existe! Você pode fazer login.", user: { email } })
      }
      if (lower.includes("database error checking email")) {
        try {
          const list = await supabaseAdmin.auth.admin.listUsers()
          const found = list.data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
          if (found) {
            return NextResponse.json({ success: true, message: "Usuário já existe! Você pode fazer login.", user: { id: found.id, email: found.email } })
          }
        } catch {}
        return NextResponse.json({ success: false, error: "Supabase Auth indisponível ao verificar e-mail. Tente novamente em alguns minutos." }, { status: 503 })
      }
      return NextResponse.json({ success: false, error: msg }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Usuário administrador criado com sucesso!",
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Erro interno: ${error instanceof Error ? error.message : "desconhecido"}`,
      },
      { status: 500 },
    )
  }
}
