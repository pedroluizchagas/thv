const stats = [
  { value: "15+", label: "Anos no Mercado" },
  { value: "5.000+", label: "Clientes Satisfeitos" },
  { value: "10.000+", label: "Peças Entregues" },
  { value: "27", label: "Estados Atendidos" },
]

export function Stats() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl lg:text-5xl font-bold text-primary-foreground">{stat.value}</p>
              <p className="text-primary-foreground/80 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
