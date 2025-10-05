import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category")
    const country = searchParams.get("country")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")

    const where: any = {
      status: "PUBLISHED",
      ...(query && {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { country: { contains: query, mode: "insensitive" } },
        ],
      }),
    }

    if (category) {
      where.category = category
    }

    if (country) {
      where.countryCode = country.toUpperCase()
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        where.price.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice)
      }
    }

    const services = await prisma.service.findMany({
      where,
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
      take: 50, // Limit results
    })

    // Calculate average rating for each service
    const servicesWithRating = services.map((service) => ({
      ...service,
      averageRating:
        service.reviews.length > 0
          ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
          : 0,
    }))

    return NextResponse.json({
      services: servicesWithRating,
      count: servicesWithRating.length,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Failed to search services" },
      { status: 500 }
    )
  }
}
