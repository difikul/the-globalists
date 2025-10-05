"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const serviceSchema = z.object({
  category: z.enum([
    "CITIZENSHIP",
    "RESIDENCY",
    "COMPANY_INCORPORATION",
    "BANKING",
    "INSURANCE",
    "SHIPPING",
  ]),
  title: z.string().min(5, "Název musí mít alespoň 5 znaků"),
  description: z.string().min(50, "Popis musí mít alespoň 50 znaků"),
  price: z.string().min(1, "Zadejte cenu"),
  country: z.string().min(2, "Zadejte zemi"),
  countryCode: z.string().length(2, "Kód země musí mít 2 znaky"),
  features: z.string().min(1, "Přidejte výhody (každá na novém řádku)"),
  processingTime: z.string().optional(),
  requirements: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "PAUSED"]),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditServicePage({ params }: PageProps) {
  const router = useRouter()
  const [serviceId, setServiceId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [loadingService, setLoadingService] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  })

  useEffect(() => {
    const loadService = async () => {
      try {
        const resolvedParams = await params
        setServiceId(resolvedParams.id)

        const response = await fetch(`/api/services/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error("Failed to load service")
        }

        const service = await response.json()

        // Parse JSON fields and prepare form data
        const features = JSON.parse(service.features as string) as string[]
        const requirements = service.requirements
          ? (JSON.parse(service.requirements as string) as string[])
          : []

        reset({
          category: service.category,
          title: service.title,
          description: service.description,
          price: service.price.toString(),
          country: service.country,
          countryCode: service.countryCode,
          features: features.join("\n"),
          processingTime: service.processingTime || "",
          requirements: requirements.join("\n"),
          status: service.status,
        })
      } catch (error) {
        setError("Chyba při načítání služby")
        console.error(error)
      } finally {
        setLoadingService(false)
      }
    }

    loadService()
  }, [params, reset])

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          countryCode: data.countryCode.toUpperCase(),
          features: data.features.split("\n").filter(Boolean),
          requirements: data.requirements
            ? data.requirements.split("\n").filter(Boolean)
            : [],
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Chyba při aktualizaci služby")
        return
      }

      router.push("/dashboard/services")
      router.refresh()
    } catch (error) {
      setError("Došlo k chybě při aktualizaci služby")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Opravdu chcete smazat tuto službu? Tuto akci nelze vrátit zpět.")) {
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Chyba při mazání služby")
        return
      }

      router.push("/dashboard/services")
      router.refresh()
    } catch (error) {
      setError("Došlo k chybě při mazání služby")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loadingService) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Načítání služby...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upravit službu</h1>
        <p className="text-muted-foreground">
          Aktualizujte informace o vaší službě
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Základní informace</CardTitle>
            <CardDescription>
              Základní údaje o vaší službě
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Stav služby</Label>
              <select
                id="status"
                {...register("status")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isLoading || isDeleting}
              >
                <option value="DRAFT">Koncept</option>
                <option value="PUBLISHED">Publikováno</option>
                <option value="PAUSED">Pozastaveno</option>
              </select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <select
                id="category"
                {...register("category")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isLoading || isDeleting}
              >
                <option value="">Vyberte kategorii</option>
                <option value="CITIZENSHIP">Občanství</option>
                <option value="RESIDENCY">Rezidence</option>
                <option value="COMPANY_INCORPORATION">Založení firmy</option>
                <option value="BANKING">Banking</option>
                <option value="INSURANCE">Pojištění</option>
                <option value="SHIPPING">Přeprava</option>
              </select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Název služby</Label>
              <Input
                id="title"
                placeholder="Malta Citizenship by Investment"
                {...register("title")}
                disabled={isLoading || isDeleting}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis</Label>
              <textarea
                id="description"
                placeholder="Detailní popis služby..."
                {...register("description")}
                disabled={isLoading || isDeleting}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Cena (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="750000"
                  {...register("price")}
                  disabled={isLoading || isDeleting}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingTime">Doba zpracování</Label>
                <Input
                  id="processingTime"
                  placeholder="12-14 měsíců"
                  {...register("processingTime")}
                  disabled={isLoading || isDeleting}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Země</Label>
                <Input
                  id="country"
                  placeholder="Malta"
                  {...register("country")}
                  disabled={isLoading || isDeleting}
                />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryCode">Kód země (ISO)</Label>
                <Input
                  id="countryCode"
                  placeholder="MT"
                  maxLength={2}
                  {...register("countryCode")}
                  disabled={isLoading || isDeleting}
                />
                {errors.countryCode && (
                  <p className="text-sm text-destructive">
                    {errors.countryCode.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Výhody a požadavky</CardTitle>
            <CardDescription>
              Co vaše služba nabízí a co je potřeba
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="features">Výhody (každá na novém řádku)</Label>
              <textarea
                id="features"
                placeholder="EU Passport&#10;Bezvízový vstup do 180+ zemí&#10;Proces 12-14 měsíců"
                {...register("features")}
                disabled={isLoading || isDeleting}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {errors.features && (
                <p className="text-sm text-destructive">{errors.features.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">
                Požadavky (každý na novém řádku)
              </Label>
              <textarea
                id="requirements"
                placeholder="Čistý trestní rejstřík&#10;Důkaz o finančních prostředcích&#10;Zdravotní pojištění"
                {...register("requirements")}
                disabled={isLoading || isDeleting}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {errors.requirements && (
                <p className="text-sm text-destructive">
                  {errors.requirements.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading || isDeleting} size="lg">
              {isLoading ? "Ukládá se..." : "Uložit změny"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading || isDeleting}
              size="lg"
            >
              Zrušit
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || isDeleting}
            size="lg"
          >
            {isDeleting ? "Maže se..." : "Smazat službu"}
          </Button>
        </div>
      </form>
    </div>
  )
}
