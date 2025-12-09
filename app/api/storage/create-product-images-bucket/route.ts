import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      return NextResponse.json(
        { success: false, error: "Variáveis de ambiente do Supabase não configuradas" },
        { status: 500 },
      )
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: bucketInfo } = await admin.storage.getBucket("product-images")
    if (bucketInfo) {
      const { error: updErr } = await admin.storage.updateBucket("product-images", { public: true })
      if (updErr) {
        return NextResponse.json({ success: false, error: updErr.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: "Bucket já existia; atualizado para público." })
    }

    const { data, error } = await admin.storage.createBucket("product-images", { public: true })
    if (error) {
      const lower = error.message.toLowerCase()
      if (lower.includes("exists")) {
        const { error: updErr } = await admin.storage.updateBucket("product-images", { public: true })
        if (updErr) {
          return NextResponse.json({ success: false, error: updErr.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, message: "Bucket já existia; atualizado para público." })
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, bucket: data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Erro desconhecido" }, { status: 500 })
  }
}
