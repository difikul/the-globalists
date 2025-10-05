import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reviewSchema = z.object({
  serviceId: z.string().cuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Komentář musí mít alespoň 10 znaků").optional(),
})

// POST - Create a new review
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can write reviews" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check if user purchased this service
    const purchase = await prisma.transaction.findFirst({
      where: {
        buyerId: session.user.id,
        serviceId: validatedData.serviceId,
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { error: "You must purchase this service before reviewing it" },
        { status: 403 }
      )
    }

    // Check if user already reviewed this service
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        serviceId: validatedData.serviceId,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this service" },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        status: "PUBLISHED", // Auto-publish for now, can add moderation later
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}
