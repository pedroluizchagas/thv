import { CheckCircle } from "lucide-react"

const benefits = [
  "Expertise técnica de ponta",
  "Alcance logístico em 100% do território nacional",
  "Processo de recondicionamento com padrões de engenharia",
  "Testes de bancada em condições extremas",
  "Suporte técnico especializado",
]

export function About() {
  return (
    <section id="sobre" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-card">
              <img
                src="/industrial-hydraulic-workshop-mechanics-working-tr.jpg"
                alt="THV Hidraulic Parts - Oficina"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-lg hidden lg:block">
              <p className="text-3xl font-bold">15+</p>
              <p className="text-sm">Anos de Experiência</p>
            </div>
          </div>

          <div>
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">Sobre Nós</span>
            <h2 className="text-3xl lg:text-5xl font-bold mt-4 text-balance">
              Quem é a <span className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">THV Hidraulic Parts?</span>
            </h2>
            <p className="text-muted-foreground mt-6 leading-relaxed">
              Sediada estrategicamente em Divinópolis, Minas Gerais — um dos maiores polos logísticos e industriais do
              estado — a THV Hidraulic Parts é a referência nacional em soluções para sistemas de direção hidráulica da
              linha pesada.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Não vendemos apenas peças; entregamos segurança, durabilidade e a garantia de que o seu veículo voltará
              para a estrada com desempenho de fábrica.
            </p>

            <ul className="mt-8 space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
