import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabase() {
  console.log('🧪 Testing Database Connection and Data\n')
  console.log('=' .repeat(60))

  try {
    // Test 1: Check database connection
    console.log('\n✅ Test 1: Database Connection')
    await prisma.$connect()
    console.log('   ✓ Successfully connected to PostgreSQL')

    // Test 2: Count all models
    console.log('\n✅ Test 2: Model Counts')
    const userCount = await prisma.user.count()
    const providerCount = await prisma.provider.count()
    const serviceCount = await prisma.service.count()
    const reviewCount = await prisma.review.count()
    const transactionCount = await prisma.transaction.count()
    const subscriptionCount = await prisma.subscription.count()

    console.log(`   Users: ${userCount}`)
    console.log(`   Providers: ${providerCount}`)
    console.log(`   Services: ${serviceCount}`)
    console.log(`   Reviews: ${reviewCount}`)
    console.log(`   Transactions: ${transactionCount}`)
    console.log(`   Subscriptions: ${subscriptionCount}`)

    // Test 3: Verify test accounts
    console.log('\n✅ Test 3: Test Accounts')
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@theglobalists.com' },
      select: { id: true, email: true, role: true, name: true }
    })
    const provider = await prisma.user.findUnique({
      where: { email: 'provider@example.com' },
      select: { id: true, email: true, role: true, name: true }
    })
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@example.com' },
      select: { id: true, email: true, role: true, name: true }
    })

    console.log('   Admin:', admin ? '✓' : '✗', admin?.email, `(${admin?.role})`)
    console.log('   Provider:', provider ? '✓' : '✗', provider?.email, `(${provider?.role})`)
    console.log('   Customer:', customer ? '✓' : '✗', customer?.email, `(${customer?.role})`)

    // Test 4: Verify Provider profiles
    console.log('\n✅ Test 4: Provider Profiles')
    const providers = await prisma.provider.findMany({
      include: {
        user: { select: { email: true } },
        _count: { select: { services: true } }
      }
    })

    providers.forEach(p => {
      console.log(`   ${p.companyName}:`)
      console.log(`     - Plan: ${p.subscriptionPlan}`)
      console.log(`     - Commission: ${p.commissionRate * 100}%`)
      console.log(`     - Services: ${p._count.services}`)
      console.log(`     - Verified: ${p.verificationStatus}`)
    })

    // Test 5: Verify Services
    console.log('\n✅ Test 5: Services')
    const services = await prisma.service.findMany({
      include: {
        provider: { select: { companyName: true } },
        _count: { select: { reviews: true } }
      }
    })

    services.forEach(s => {
      console.log(`   ${s.title}:`)
      console.log(`     - Provider: ${s.provider.companyName}`)
      console.log(`     - Category: ${s.category}`)
      console.log(`     - Price: $${s.price.toLocaleString()}`)
      console.log(`     - Status: ${s.status}`)
      console.log(`     - Reviews: ${s._count.reviews}`)
      console.log(`     - Views: ${s.viewCount}`)
    })

    // Test 6: Verify Reviews
    console.log('\n✅ Test 6: Reviews')
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true } },
        service: { select: { title: true } }
      }
    })

    if (reviews.length === 0) {
      console.log('   No reviews yet')
    } else {
      reviews.forEach(r => {
        console.log(`   ${r.user.name} → ${r.service.title}:`)
        console.log(`     - Rating: ${'⭐'.repeat(r.rating)}`)
        console.log(`     - Comment: ${r.comment || 'No comment'}`)
      })
    }

    // Test 7: Test Relationships
    console.log('\n✅ Test 7: Relationship Integrity')

    // User → Provider
    const usersWithProvider = await prisma.user.findMany({
      where: { provider: { isNot: null } },
      include: { provider: true }
    })
    console.log(`   Users with Provider profile: ${usersWithProvider.length}`)

    // Provider → Services
    const providersWithServices = await prisma.provider.findMany({
      where: { services: { some: {} } },
      include: { _count: { select: { services: true } } }
    })
    console.log(`   Providers with services: ${providersWithServices.length}`)

    // Service → Reviews
    const servicesWithReviews = await prisma.service.findMany({
      where: { reviews: { some: {} } },
      include: { _count: { select: { reviews: true } } }
    })
    console.log(`   Services with reviews: ${servicesWithReviews.length}`)

    // Test 8: Test Enum Values
    console.log('\n✅ Test 8: Enum Coverage')

    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    })
    console.log('   User Roles:')
    roleDistribution.forEach(r => console.log(`     - ${r.role}: ${r._count.role}`))

    const categoryDistribution = await prisma.service.groupBy({
      by: ['category'],
      _count: { category: true }
    })
    console.log('   Service Categories:')
    categoryDistribution.forEach(c => console.log(`     - ${c.category}: ${c._count.category}`))

    const statusDistribution = await prisma.service.groupBy({
      by: ['status'],
      _count: { status: true }
    })
    console.log('   Service Status:')
    statusDistribution.forEach(s => console.log(`     - ${s.status}: ${s._count.status}`))

    // Test 9: Test Unique Constraints
    console.log('\n✅ Test 9: Unique Constraints')

    const duplicateEmails = await prisma.user.groupBy({
      by: ['email'],
      _count: { email: true },
      having: { email: { _count: { gt: 1 } } }
    })
    console.log(`   Duplicate emails: ${duplicateEmails.length === 0 ? '✓ None' : '✗ Found ' + duplicateEmails.length}`)

    const duplicateSlugs = await prisma.service.groupBy({
      by: ['slug'],
      _count: { slug: true },
      having: { slug: { _count: { gt: 1 } } }
    })
    console.log(`   Duplicate slugs: ${duplicateSlugs.length === 0 ? '✓ None' : '✗ Found ' + duplicateSlugs.length}`)

    // Test 10: Test Data Integrity
    console.log('\n✅ Test 10: Data Integrity')

    // Verify all foreign keys are valid by counting related records
    const providersCount = await prisma.provider.count()
    const usersWithProviderRole = await prisma.user.count({
      where: { role: 'PROVIDER' }
    })
    console.log(`   Providers integrity: ${providersCount <= usersWithProviderRole ? '✓ Valid' : '✗ Invalid'}`)

    const servicesCount = await prisma.service.count()
    const servicesWithValidProvider = await prisma.service.findMany({
      where: { provider: {} }
    })
    console.log(`   Services integrity: ${servicesCount === servicesWithValidProvider.length ? '✓ All valid' : '✗ Some invalid'}`)

    console.log('\n' + '='.repeat(60))
    console.log('✅ Database testing completed successfully!\n')

  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
