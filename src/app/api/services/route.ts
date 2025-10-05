import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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
  price: z.number().positive("Cena musí být kladné číslo"),
  country: z.string().min(2, "Zadejte zemi"),
  countryCode: z.string().length(2, "Kód země musí mít 2 znaky"),
  features: z.array(z.string()).min(1, "Přidejte alespoň 1 výhodu"),
  processingTime: z.string().optional(),
  requirements: z.array(z.string()).optional(),
})

// GET /api/services - List all services (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const country = searchParams.get("country")

    const services = await prisma.service.findMany({
      where: {
        status: "PUBLISHED",
        ...(category && { category: category as any }),
        ...(country && { countryCode: country }),
      },
      include: {
        provider: {
          select: {
            companyName: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error("GET /api/services error:", error)
    return NextResponse.json(
      { error: "Chyba při načítání služeb" },
      { status: 500 }
    )
  }
}

// POST /api/services - Create new service (provider only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user.role !== "PROVIDER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get provider
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Provider profile not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    // Generate slug
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Math.random().toString(36).substr(2, 6)

    const service = await prisma.service.create({
      data: {
        providerId: provider.id,
        category: validatedData.category,
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        country: validatedData.country,
        countryCode: validatedData.countryCode.toUpperCase(),
        features: JSON.stringify(validatedData.features),
        processingTime: validatedData.processingTime,
        requirements: validatedData.requirements
          ? JSON.stringify(validatedData.requirements)
          : null,
        slug,
        status: "DRAFT",
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("POST /api/services error:", error)
    return NextResponse.json(
      { error: "Chyba při vytváření služby" },
      { status: 500 }
    )
  }
}
