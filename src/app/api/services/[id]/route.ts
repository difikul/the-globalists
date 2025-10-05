import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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
  features: z.array(z.string()),
  processingTime: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "PAUSED"]).optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET single service
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Only the provider or admin can view draft/paused services
    if (
      service.status !== "PUBLISHED" &&
      service.provider.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    )
  }
}

// PUT update service
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "PROVIDER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    })

    if (!provider && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check if user owns this service (or is admin)
    if (provider && service.providerId !== provider.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    // Generate slug from title
    const slug =
      validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now()

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...validatedData,
        slug,
        features: JSON.stringify(validatedData.features),
        requirements: validatedData.requirements
          ? JSON.stringify(validatedData.requirements)
          : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error updating service:", error)
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    )
  }
}

// DELETE service
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "PROVIDER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    })

    if (!provider && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        reviews: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check if user owns this service (or is admin)
    if (provider && service.providerId !== provider.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if service has any purchases
    if (service.purchaseCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete service with purchases. Please pause it instead." },
        { status: 400 }
      )
    }

    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    )
  }
}
