import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ServicesPage() {
  const session = await auth()

  if (!session || (session.user.role !== "PROVIDER" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    include: {
      services: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!provider) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mé služby</h1>
          <p className="text-muted-foreground">
            Spravujte své nabízené služby
          </p>
        </div>
        <Link href="/dashboard/services/new">
          <Button size="lg">+ Přidat službu</Button>
        </Link>
      </div>

      {provider.services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Zatím nemáte žádné služby
            </p>
            <Link href="/dashboard/services/new">
              <Button>Vytvořit první službu</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {provider.services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {service.title}
                      {service.isPromoted && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-normal text-amber-800">
                          ⭐ Promoted
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-normal ${
                          service.status === "PUBLISHED"
                            ? "bg-green-100 text-green-800"
                            : service.status === "DRAFT"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {service.status}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {service.category} • {service.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ${service.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{service.viewCount} zobrazení</span>
                  <span>{service.purchaseCount} prodejů</span>
                  <span>
                    Vytvořeno {new Date(service.createdAt).toLocaleDateString("cs")}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/service/${service.slug}`}>
                    <Button variant="outline" size="sm">
                      Náhled
                    </Button>
                  </Link>
                  <Link href={`/dashboard/services/${service.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Upravit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
