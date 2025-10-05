import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ServiceDetailPage({ params }: Props) {
  const resolvedParams = await params
  const { slug } = resolvedParams
  const session = await getServerSession(authOptions)

  const service = await prisma.service.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      provider: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      reviews: {
        where: { status: "PUBLISHED" },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!service) {
    notFound()
  }

  // Increment view count
  await prisma.service.update({
    where: { id: service.id },
    data: { viewCount: { increment: 1 } },
  })

  const features = JSON.parse(service.features as string) as string[]
  const requirements = service.requirements
    ? (JSON.parse(service.requirements as string) as string[])
    : []

  const averageRating =
    service.reviews.length > 0
      ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
      : 0

  return (
    <div className="container py-12">
      <Link
        href={`/services/${service.category.toLowerCase().replace(/_/g, "-")}`}
        className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
      >
        ← Zpět na {service.category}
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              {service.isPromoted && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                  ⭐ Propagováno
                </span>
              )}
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                {service.category}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{service.title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{service.country} {service.countryCode}</span>
              {service.processingTime && (
                <>
                  <span>•</span>
                  <span>{service.processingTime}</span>
                </>
              )}
              <span>•</span>
              <span>{service.viewCount} zobrazení</span>
            </div>

            {averageRating > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-2xl ${
                        star <= Math.round(averageRating)
                          ? "text-amber-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-lg font-semibold">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({service.reviews.length} hodnocení)
                </span>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>O službě</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{service.description}</p>
            </CardContent>
          </Card>

          {features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Výhody</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Požadavky</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Hodnocení ({service.reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {service.reviews.length === 0 ? (
                <p className="text-muted-foreground">Zatím žádná hodnocení</p>
              ) : (
                <div className="space-y-6">
                  {service.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{review.user.name}</span>
                        <span className="text-muted-foreground text-sm">
                          {new Date(review.createdAt).toLocaleDateString("cs")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= review.rating
                                ? "text-amber-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                ${service.price.toLocaleString()}
              </CardTitle>
              <CardDescription>Jednorázová platba</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {session ? (
                <Button size="lg" className="w-full">
                  Koupit službu
                </Button>
              ) : (
                <Link href="/auth/login">
                  <Button size="lg" className="w-full">
                    Přihlásit se pro nákup
                  </Button>
                </Link>
              )}
              <p className="text-sm text-muted-foreground text-center">
                Bezpečná platba přes Stripe
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>O poskytovateli</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{service.provider.companyName}</h3>
                  {service.provider.verificationStatus === "VERIFIED" && (
                    <span className="text-green-600" title="Ověřený poskytovatel">
                      ✓
                    </span>
                  )}
                </div>
                {service.provider.description && (
                  <p className="text-sm text-muted-foreground">
                    {service.provider.description}
                  </p>
                )}
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Plán: {service.provider.subscriptionPlan}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Provize: {service.provider.commissionRate * 100}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
