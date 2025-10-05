import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const categories = [
    {
      title: "Občanství",
      description: "Programy pro získání druhého občanství",
      icon: "🛂",
      href: "/services/citizenship",
    },
    {
      title: "Rezidence",
      description: "Pobytová povolení a dlouhodobé pobyty",
      icon: "🏠",
      href: "/services/residency",
    },
    {
      title: "Založení společnosti",
      description: "Registrace firem v různých jurisdikcích",
      icon: "🏢",
      href: "/services/company-incorporation",
    },
    {
      title: "Banking",
      description: "Otevření mezinárodních bankovních účtů",
      icon: "🏦",
      href: "/services/banking",
    },
    {
      title: "Pojištění",
      description: "Mezinárodní pojistné produkty",
      icon: "🛡️",
      href: "/services/insurance",
    },
    {
      title: "Přeprava",
      description: "Mezinárodní přepravní služby",
      icon: "📦",
      href: "/services/shipping",
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/20">
        <div className="container flex flex-col items-center gap-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Váš přístup k mezinárodním službám
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Spojujeme vás s ověřenými poskytovateli služeb pro občanství,
            rezidence, zakládání firem a další mezinárodní služby.
          </p>
          <div className="flex gap-4 mt-8">
            <Link href="/services">
              <Button size="lg">Prozkoumat služby</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">
                Začít poskytovat
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Prozkoumejte kategorie
          </h2>
          <p className="mt-2 text-muted-foreground">
            Najděte službu, kterou potřebujete
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.href} href={category.href}>
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="mb-2 text-4xl">{category.icon}</div>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 text-4xl">✓</div>
              <h3 className="mb-2 font-semibold">Ověření poskytovatelé</h3>
              <p className="text-sm text-muted-foreground">
                Všichni poskytovatelé procházejí důkladným ověřením
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl">💳</div>
              <h3 className="mb-2 font-semibold">Bezpečné platby</h3>
              <p className="text-sm text-muted-foreground">
                Chráněné transakce přes Stripe
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl">🌍</div>
              <h3 className="mb-2 font-semibold">Globální pokrytí</h3>
              <p className="text-sm text-muted-foreground">
                Služby ve více než 50 zemích světa
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
