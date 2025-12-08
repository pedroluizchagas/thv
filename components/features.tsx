import { Wrench, DollarSign, Truck, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: Wrench,
    title: "Recondicionamento Especializado",
    description:
      "Processo rigoroso com retífica de precisão, substituição de componentes críticos e testes de bancada simulando condições extremas.",
  },
  {
    icon: DollarSign,
    title: "Melhor Preço do Mercado",
    description:
      "Eliminamos intermediários desnecessários. Preços de atacado acessíveis para transportadoras e caminhoneiros autônomos.",
  },
  {
    icon: Truck,
    title: "Logística Nacional",
    description:
      "De Divinópolis-MG para todo Brasil. Envio imediato com rastreamento completo e parcerias com as melhores transportadoras.",
  },
  {
    icon: ShieldCheck,
    title: "Garantia de Qualidade",
    description: "Todas as peças passam por testes de pressão e vazão. Garantia estendida para sua tranquilidade.",
  },
]

export function Features() {
  return (
    <section id="diferenciais" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Diferenciais</span>
          <h2 className="text-3xl lg:text-5xl font-bold mt-4 text-balance">
            Por que a THV é <span className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">Líder?</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Sustentamos nossa operação em pilares inegociáveis de qualidade, preço e agilidade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
