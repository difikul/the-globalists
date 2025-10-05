import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const isProvider = session.user.role === "PROVIDER" || session.user.role === "ADMIN"

  if (!isProvider) {
    // Customer Dashboard
    const purchases = await prisma.transaction.findMany({
      where: { buyerId: session.user.id },
      include: {
        service: {
          include: {
            provider: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Vítejte, {session.user.name}!</h1>
          <p className="text-muted-foreground">
            Spravujte své nákupy a oblíbené služby
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Mé nákupy</CardTitle>
              <CardDescription>Celkem transakcí</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{purchases.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Poslední nákupy</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-muted-foreground">Zatím jste nic nenakoupili</p>
            ) : (
              <div className="space-y-4">
                {purchases.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{transaction.service.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.service.provider.companyName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Link href="/services">
          <Button size="lg">Prozkoumat služby</Button>
        </Link>
      </div>
    )
  }

  // Provider Dashboard
  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    include: {
      services: true,
      sales: {
        where: { status: "COMPLETED" },
      },
    },
  })

  if (!provider) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Vítejte!</h1>
          <p className="text-muted-foreground">
            Nejste ještě zaregistrován jako poskytovatel
          </p>
        </div>
        <Link href="/provider/register">
          <Button size="lg">Stát se poskytovatelem</Button>
        </Link>
      </div>
    )
  }

  const totalRevenue = provider.sales.reduce(
    (sum, sale) => sum + sale.sellerAmount,
    0
  )
  const publishedServices = provider.services.filter(
    (s) => s.status === "PUBLISHED"
  ).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Vítejte zpět!</h1>
        <p className="text-muted-foreground">{provider.companyName}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Celkové služby</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{provider.services.length}</div>
            <p className="text-sm text-muted-foreground">
              {publishedServices} publikováno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Celkový příjem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              {provider.sales.length} prodejů
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provize</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {provider.commissionRate * 100}%
            </div>
            <p className="text-sm text-muted-foreground">
              Plán: {provider.subscriptionPlan}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {provider.verificationStatus === "VERIFIED" ? "✓" : "⏳"}
            </div>
            <p className="text-sm text-muted-foreground">
              {provider.verificationStatus}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/services/new">
          <Button size="lg">+ Přidat službu</Button>
        </Link>
        <Link href="/dashboard/services">
          <Button variant="outline" size="lg">
            Spravovat služby
          </Button>
        </Link>
      </div>
    </div>
  )
}
