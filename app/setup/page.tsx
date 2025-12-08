"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, XCircle, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSetup() {
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(data.error || "Erro ao criar usuário")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Erro de conexão com o servidor")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/thv-hidraulic-parts.png"
              alt="THV Hidraulic Parts"
              width={180}
              height={48}
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl">Configuração Inicial</CardTitle>
          <CardDescription>Configure o usuário administrador para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Dados do administrador:</p>
                <p className="text-sm text-muted-foreground">Email: thvhidraulicparts@gmail.com</p>
                <p className="text-sm text-muted-foreground">Senha: ********</p>
              </div>
              <Button onClick={handleSetup} className="w-full" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Criar Usuário Administrador
              </Button>
            </>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Criando usuário administrador...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="text-center font-medium text-green-600">{message}</p>
              </div>
              <Link href="/login">
                <Button className="w-full" size="lg">
                  Ir para Login
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-4">
                <XCircle className="w-12 h-12 text-red-500" />
                <p className="text-center font-medium text-red-600">{message}</p>
              </div>
              <Button onClick={handleSetup} variant="outline" className="w-full bg-transparent">
                Tentar Novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
