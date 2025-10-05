import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Začínám seedování databáze...")

  // Vyčistit existující data
  await prisma.review.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.service.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.provider.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Admin uživatel
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.create({
    data: {
      email: "admin@theglobalists.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })
  console.log("✅ Admin vytvořen")

  // Test zákazník
  const customerPassword = await bcrypt.hash("customer123", 12)
  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      password: customerPassword,
      name: "Test Customer",
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  })
  console.log("✅ Test zákazník vytvořen")

  // Test provider uživatel
  const providerPassword = await bcrypt.hash("provider123", 12)
  const providerUser = await prisma.user.create({
    data: {
      email: "provider@example.com",
      password: providerPassword,
      name: "Test Provider",
      role: "PROVIDER",
      emailVerified: new Date(),
    },
  })

  // Provider profil
  const provider = await prisma.provider.create({
    data: {
      userId: providerUser.id,
      companyName: "Global Services Inc.",
      description: "Přední poskytovatel služeb pro mezinárodní občanství a rezidenci s více než 15 lety zkušeností.",
      website: "https://globalservices.example.com",
      phone: "+420 123 456 789",
      subscriptionPlan: "VERIFIED",
      commissionRate: 0.05,
      verificationStatus: "VERIFIED",
      stripeOnboarded: false,
    },
  })
  console.log("✅ Test provider vytvořen")

  // Test služby
  const services = [
    {
      providerId: provider.id,
      category: "CITIZENSHIP",
      title: "Malta Citizenship by Investment",
      description:
        "Získejte maltské občanství prostřednictvím investičního programu. Zahrnuje EU pas, bezvízový vstup do 180+ zemí a nízké zdanění. Proces trvá 12-14 měsíců.",
      price: 750000,
      country: "Malta",
      countryCode: "MT",
      features: JSON.stringify([
        "EU Passport",
        "Bezvízový vstup do 180+ zemí",
        "Proces 12-14 měsíců",
        "Nízké zdanění",
        "Rodinné zahrnutí možné",
      ]),
      processingTime: "12-14 měsíců",
      requirements: JSON.stringify([
        "Čistý trestní rejstřík",
        "Důkaz o finančních prostředcích",
        "Zdravotní pojištění",
        "Investice €650,000+",
      ]),
      status: "PUBLISHED",
      slug: "malta-citizenship-investment",
      metaTitle: "Malta Citizenship by Investment - EU Passport",
      metaDescription:
        "Získejte maltské občanství a EU pas prostřednictvím investičního programu. 12-14 měsíců.",
      publishedAt: new Date(),
      viewCount: 1247,
      purchaseCount: 12,
    },
    {
      providerId: provider.id,
      category: "RESIDENCY",
      title: "Portugal Golden Visa",
      description:
        "Získejte portugalskou rezidenci prostřednictvím investice do nemovitostí nebo fondů. Cesta k občanství EU za 5 let.",
      price: 280000,
      country: "Portugal",
      countryCode: "PT",
      features: JSON.stringify([
        "Rezidence EU",
        "Cesta k občanství za 5 let",
        "Volný pohyb v Schengenu",
        "Flexibilní požadavky na pobyt",
      ]),
      processingTime: "6-8 měsíců",
      requirements: JSON.stringify([
        "Investice €280,000+",
        "Čistý trestní rejstřík",
        "Zdravotní pojištění",
      ]),
      status: "PUBLISHED",
      slug: "portugal-golden-visa",
      metaTitle: "Portugal Golden Visa - EU Residency",
      metaDescription:
        "Získejte portugalskou rezidenci prostřednictvím Golden Visa programu.",
      publishedAt: new Date(),
      viewCount: 892,
      purchaseCount: 24,
    },
    {
      providerId: provider.id,
      category: "COMPANY_INCORPORATION",
      title: "Dubai LLC Company Formation",
      description:
        "Založte společnost v Dubai s plným vlastnictvím a nulovým zdaněním. Ideální pro mezinárodní obchod.",
      price: 15000,
      country: "United Arab Emirates",
      countryCode: "AE",
      features: JSON.stringify([
        "100% zahraniční vlastnictví",
        "0% zdanění firem",
        "Rychlá registrace",
        "Bankovní účet zahrnut",
      ]),
      processingTime: "2-3 týdny",
      requirements: JSON.stringify([
        "Kopie pasu",
        "Obchodní plán",
        "Důkaz o adrese",
      ]),
      status: "PUBLISHED",
      slug: "dubai-llc-company-formation",
      publishedAt: new Date(),
      viewCount: 654,
      purchaseCount: 45,
    },
  ]

  for (const serviceData of services) {
    await prisma.service.create({ data: serviceData })
  }
  console.log("✅ Test služby vytvořeny")

  // Test recenze
  await prisma.review.create({
    data: {
      serviceId: (await prisma.service.findFirst())!.id,
      userId: customer.id,
      rating: 5,
      comment: "Vynikající služba! Profesionální přístup a rychlé vyřízení. Velmi doporučuji.",
      status: "PUBLISHED",
    },
  })
  console.log("✅ Test recenze vytvořena")

  console.log("🎉 Seedování dokončeno!")
  console.log("\n📧 Testovací účty:")
  console.log("Admin: admin@theglobalists.com / admin123")
  console.log("Provider: provider@example.com / provider123")
  console.log("Customer: customer@example.com / customer123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
