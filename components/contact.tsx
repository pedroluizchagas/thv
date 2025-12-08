"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const PHONE_NUMBER = "(37) 99922-0892"
const WHATSAPP_NUMBER = "5537999220892"

const contactInfo = [
  {
    icon: MapPin,
    title: "Endereço",
    content: "Divinópolis, MG - Brasil",
  },
  {
    icon: Phone,
    title: "Telefone",
    content: PHONE_NUMBER,
  },
  {
    icon: Mail,
    title: "E-mail",
    content: "contato@thvhidraulicparts.com.br",
  },
  {
    icon: Clock,
    title: "Horário",
    content: "Seg-Sex: 8h às 18h",
  },
]

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("quote_requests").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        status: "pending",
      })

      if (error) throw error

      setSubmitted(true)
      setFormData({ name: "", email: "", phone: "", message: "" })
    } catch (error) {
      console.error("Erro ao enviar:", error)
      alert("Erro ao enviar solicitação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contato" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Contato</span>
          <h2 className="text-3xl lg:text-5xl font-bold mt-4 text-balance">
            Fale com a <span className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">THV</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Entre em contato conosco para orçamentos, dúvidas técnicas ou informações sobre nossos produtos.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{info.title}</p>
                    <p className="font-medium text-card-foreground break-all inline-block max-w-full">{info.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">WhatsApp Direto</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Atendimento rápido pelo WhatsApp. Envie suas dúvidas ou solicite orçamentos.
              </p>
              <Button
                className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] text-primary-foreground hover:opacity-90 transition-opacity gap-2"
                onClick={() =>
                  window.open(
                    `https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Gostaria de solicitar um orçamento.`,
                    "_blank",
                  )
                }
              >
                <MessageCircle className="w-4 h-4" />
                Chamar no WhatsApp
              </Button>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-card border border-border rounded-lg p-6 lg:p-8">
            <h3 className="text-xl font-semibold mb-6 text-card-foreground">Solicitar Orçamento</h3>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-lg font-semibold text-card-foreground mb-2">Solicitação Enviada!</h4>
                <p className="text-muted-foreground mb-4">
                  Recebemos sua solicitação e entraremos em contato em breve.
                </p>
                <Button className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] text-primary-foreground hover:opacity-90 transition-opacity" onClick={() => setSubmitted(false)}>
                  Enviar nova solicitação
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm text-muted-foreground mb-1.5 block">
                    Nome completo
                  </label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-secondary border-border"
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="text-sm text-muted-foreground mb-1.5 block">
                      E-mail
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-sm text-muted-foreground mb-1.5 block">
                      Telefone / WhatsApp
                    </label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="text-sm text-muted-foreground mb-1.5 block">
                    Mensagem
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Descreva o que você precisa (peças, aplicação, quantidade...)"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-secondary border-border resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#f97316] to-[#fbbf24] text-primary-foreground hover:opacity-90 transition-opacity"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
