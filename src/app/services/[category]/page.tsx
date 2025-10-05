import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const categories = {
  citizenship: {
    name: "Občanství",
    description: "Programy pro získání druhého občanství",
    icon: "🛂",
  },
  residency: {
    name: "Rezidence",
    description: "Pobytová povolení a dlouhodobé pobyty",
    icon: "🏠",
  },
  "company-incorporation": {
    name: "Založení společnosti",
    description: "Registrace firem v různých jurisdikcích",
    icon: "🏢",
  },
  banking: {
    name: "Banking",
    description: "Otevření mezinárodních bankovních účtů",
    icon: "🏦",
  },
  insurance: {
    name: "Pojištění",
    description: "Mezinárodní pojistné produkty",
    icon: "🛡️",
  },
  shipping: {
    name: "Přeprava",
    description: "Mezinárodní přepravní služby",
    icon: "📦",
  },
}

const categoryEnumMap: Record<string, string> = {
  citizenship: "CITIZENSHIP",
  residency: "RESIDENCY",
  "company-incorporation": "COMPANY_INCORPORATION",
  banking: "BANKING",
  insurance: "INSURANCE",
  shipping: "SHIPPING",
}

export async function generateStaticParams() {
  return Object.keys(categories).map((category) => ({
    category,
  }))
}

interface Props {
  params: Promise<{ category: string }>
  searchParams: Promise<{ country?: string }>
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { category } = resolvedParams
  const { country } = resolvedSearchParams

  const categoryInfo = categories[category as keyof typeof categories]

  if (!categoryInfo) {
    notFound()
  }

  const categoryEnum = categoryEnumMap[category]

  const services = await prisma.service.findMany({
    where: {
      category: categoryEnum as any,
      status: "PUBLISHED",
      ...(country && { countryCode: country.toUpperCase() }),
    },
    include: {
      provider: {
        select: {
          id: true,
          companyName: true,
          verificationStatus: true,
        },
      },
      reviews: {
        where: { status: "PUBLISHED" },
        select: { rating: true },
      },
    },
    orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
  })

  // Calculate average rating for each service
  const servicesWithRating = services.map((service) => ({
    ...service,
    averageRating:
      service.reviews.length > 0
        ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
        : 0,
  }))

  return (
    <div className="container py-12">
      <div className="mb-12">
        <div className="mb-4 text-6xl">{categoryInfo.icon}</div>
        <h1 className="text-4xl font-bold mb-2">{categoryInfo.name}</h1>
        <p className="text-xl text-muted-foreground">
          {categoryInfo.description}
        </p>
        <p className="mt-4 text-muted-foreground">
          {services.length} služeb nalezeno
        </p>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              V této kategorii zatím nejsou žádné služby
            </p>
            <Link href="/">
              <Button>Zpět na homepage</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicesWithRating.map((service) => (
            <Link key={service.id} href={`/service/${service.slug}`}>
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  {service.isPromoted && (
                    <div className="mb-2">
                      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        ⭐ Propagováno
                      </span>
                    </div>
                  )}
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{service.title}</span>
                    {service.provider.verificationStatus === "VERIFIED" && (
                      <span className="ml-2 text-green-600" title="Ověřený poskytovatel">
                        ✓
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.provider.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        ${service.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.country}
                      </p>
                    </div>
                    {service.averageRating > 0 && (
                      <div className="text-right">
                        <p className="font-semibold">
                          ⭐ {service.averageRating.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ({service.reviews.length})
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
