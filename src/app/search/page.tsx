"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Service {
  id: string
  title: string
  description: string
  price: number
  country: string
  countryCode: string
  slug: string
  category: string
  isPromoted: boolean
  provider: {
    id: string
    companyName: string
    verificationStatus: string
  }
  reviews: { rating: number }[]
  averageRating: number
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState("")
  const [country, setCountry] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)
    setHasSearched(true)

    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (category) params.set("category", category)
    if (country) params.set("country", country)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)

    try {
      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Search on initial load if there's a query parameter
  useEffect(() => {
    if (initialQuery) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Vyhledávání služeb</h1>
        <p className="text-xl text-muted-foreground">
          Najděte službu, kterou potřebujete
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtry vyhledávání</CardTitle>
          <CardDescription>
            Upřesněte své hledání pomocí filtrů
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Hledaný výraz</Label>
            <Input
              id="query"
              placeholder="Zadejte název služby, zemi nebo popis..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Všechny kategorie</option>
                <option value="CITIZENSHIP">Občanství</option>
                <option value="RESIDENCY">Rezidence</option>
                <option value="COMPANY_INCORPORATION">Založení firmy</option>
                <option value="BANKING">Banking</option>
                <option value="INSURANCE">Pojištění</option>
                <option value="SHIPPING">Přeprava</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Kód země</Label>
              <Input
                id="country"
                placeholder="např. MT, CY, PT"
                maxLength={2}
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPrice">Min. cena (USD)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max. cena (USD)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="1000000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isLoading} size="lg">
            {isLoading ? "Vyhledávám..." : "Vyhledat"}
          </Button>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="mb-4">
          <p className="text-muted-foreground">
            {isLoading ? "Vyhledávám..." : `Nalezeno ${services.length} služeb`}
          </p>
        </div>
      )}

      {services.length === 0 && hasSearched && !isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Nebyly nalezeny žádné služby odpovídající vašim kritériím
            </p>
            <Button onClick={() => {
              setQuery("")
              setCategory("")
              setCountry("")
              setMinPrice("")
              setMaxPrice("")
              setHasSearched(false)
              setServices([])
            }}>
              Vymazat filtry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
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
