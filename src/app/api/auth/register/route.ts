import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Neplatný email"),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků"),
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validace
    const validatedData = registerSchema.parse(body)

    // Kontrola, zda uživatel již existuje
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Uživatel s tímto emailem již existuje" },
        { status: 409 }
      )
    }

    // Hash hesla
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Vytvoření uživatele
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(
      { user, message: "Registrace úspěšná" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Registration] Validation error:", error.errors)
      return NextResponse.json(
        { error: error.errors[0].message, details: error.errors },
        { status: 400 }
      )
    }

    // Enhanced error logging
    console.error("[Registration] Unexpected error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        error: "Došlo k chybě při registraci",
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : String(error)
        })
      },
      { status: 500 }
    )
  }
}
