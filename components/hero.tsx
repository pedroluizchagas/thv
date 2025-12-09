import { Button } from "@/components/ui/button"
import { ArrowRight, Phone, Truck } from "lucide-react"
import Image from "next/image"

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradient lines effect */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/Hero-thv.png"
          alt="Caminhão na estrada"
          fill
          priority
          className="object-cover object-[70%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[60%]">
          <svg className="w-full h-full opacity-30" viewBox="0 0 1200 600" preserveAspectRatio="none">
            <path d="M0 400 Q 300 300, 600 350 T 1200 300" stroke="url(#gradient1)" strokeWidth="2" fill="none" />
            <path d="M0 450 Q 400 350, 700 400 T 1200 350" stroke="url(#gradient2)" strokeWidth="2" fill="none" />
            <path d="M0 500 Q 350 400, 650 450 T 1200 400" stroke="url(#gradient3)" strokeWidth="2" fill="none" />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              <Truck className="w-4 h-4" />
              Líder em Peças Hidráulicas
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] md:leading-[1.15] tracking-tight mb-6 md:mb-8 max-w-[22ch] md:max-w-[20ch]">
            <span className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">A Força</span> <span className="text-foreground">e Precisão que</span>{" "}
            <br className="hidden sm:block" />
            <span className="text-foreground">Seu Caminhão</span> <span className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">Precisa.</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10 max-w-[60ch] md:max-w-[65ch] leading-relaxed md:leading-[1.7]">
            Referência nacional em soluções para sistemas de direção hidráulica da linha pesada. Recondicionamento de
            qualidade com o melhor preço do mercado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <a href="/catalogo">
                Ver Produtos
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-border text-foreground hover:bg-secondary gap-2 bg-transparent"
            >
              <a
                href="https://wa.me/5537999220892?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20or%C3%A7amento."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="w-4 h-4" />
                Fale Conosco
              </a>
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-between gap-4 md:gap-8">
            <div>
              <p className="text-xl md:text-3xl font-bold text-primary">15+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Anos de Experiência</p>
            </div>
            <div className="h-12 w-px bg-border hidden md:block" />
            <div>
              <p className="text-xl md:text-3xl font-bold text-primary">5.000+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Clientes Atendidos</p>
            </div>
            <div className="h-12 w-px bg-border hidden md:block" />
            <div>
              <p className="text-xl md:text-3xl font-bold text-primary">100%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Brasil Atendido</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
