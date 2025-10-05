// API Testing Script for The Globalists Marketplace
// Tests all REST endpoints with proper authentication

const API_BASE = 'http://localhost:3001'

interface TestResult {
  name: string
  passed: boolean
  message: string
  duration: number
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<void>) {
  const start = Date.now()
  try {
    await testFn()
    const duration = Date.now() - start
    results.push({ name, passed: true, message: '✓ Passed', duration })
    console.log(`✓ ${name} (${duration}ms)`)
  } catch (error) {
    const duration = Date.now() - start
    const message = error instanceof Error ? error.message : String(error)
    results.push({ name, passed: false, message: `✗ ${message}`, duration })
    console.log(`✗ ${name}: ${message} (${duration}ms)`)
  }
}

// Helper function to make authenticated requests
let sessionCookie = ''

async function request(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(sessionCookie && { Cookie: sessionCookie }),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Store session cookie if present
  const setCookie = response.headers.get('set-cookie')
  if (setCookie) {
    sessionCookie = setCookie.split(';')[0]
  }

  return response
}

async function testApi() {
  console.log('🧪 Testing Backend API Endpoints\n')
  console.log('=' .repeat(60))

  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  console.log('\n📝 Auth Endpoints:')

  await runTest('POST /api/auth/register - Invalid email', async () => {
    const response = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'test123',
        name: 'Test User'
      }),
    })
    if (response.ok) throw new Error('Should reject invalid email')
  })

  await runTest('POST /api/auth/register - Weak password', async () => {
    const response = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      }),
    })
    if (response.ok) throw new Error('Should reject weak password')
  })

  await runTest('POST /api/auth/register - Duplicate email', async () => {
    const response = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@theglobalists.com',
        password: 'test12345',
        name: 'Test User'
      }),
    })
    if (response.ok) throw new Error('Should reject duplicate email')
  })

  // ============================================
  // SERVICE ENDPOINTS (Unauthenticated)
  // ============================================
  console.log('\n📦 Service Endpoints (Public):')

  await runTest('GET /api/services - List all services', async () => {
    const response = await request('/api/services')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data.services)) throw new Error('Invalid response format')
    if (data.services.length === 0) throw new Error('No services found')
  })

  // ============================================
  // SERVICE ENDPOINTS (Authenticated Required)
  // ============================================
  console.log('\n🔒 Service Endpoints (Protected):')

  await runTest('POST /api/services - Unauthorized (no auth)', async () => {
    sessionCookie = '' // Clear session
    const response = await request('/api/services', {
      method: 'POST',
      body: JSON.stringify({
        category: 'CITIZENSHIP',
        title: 'Test Service',
        description: 'This is a test service description that is longer than 50 characters.',
        price: 10000,
        country: 'Test Country',
        countryCode: 'TC',
        features: ['Feature 1', 'Feature 2'],
      }),
    })
    if (response.status !== 401) throw new Error(`Expected 401, got ${response.status}`)
  })

  // Login as provider for authenticated tests
  console.log('\n🔐 Authenticating as provider...')
  const loginResponse = await request('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({
      email: 'provider@example.com',
      password: 'provider123',
    }),
  })

  if (!loginResponse.ok) {
    console.log('✗ Authentication failed - skipping authenticated tests')
  } else {
    console.log('✓ Authenticated successfully')

    await runTest('POST /api/services - Invalid category', async () => {
      const response = await request('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          category: 'INVALID_CATEGORY',
          title: 'Test Service',
          description: 'This is a test service description.',
          price: 10000,
          country: 'Test',
          countryCode: 'TC',
          features: ['Feature 1'],
        }),
      })
      if (response.ok) throw new Error('Should reject invalid category')
    })

    await runTest('POST /api/services - Title too short', async () => {
      const response = await request('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          category: 'CITIZENSHIP',
          title: 'Test',
          description: 'This is a test service description that is longer than 50 characters.',
          price: 10000,
          country: 'Test',
          countryCode: 'TC',
          features: ['Feature 1'],
        }),
      })
      if (response.ok) throw new Error('Should reject short title')
    })

    await runTest('POST /api/services - Description too short', async () => {
      const response = await request('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          category: 'CITIZENSHIP',
          title: 'Test Service Title',
          description: 'Short description',
          price: 10000,
          country: 'Test',
          countryCode: 'TC',
          features: ['Feature 1'],
        }),
      })
      if (response.ok) throw new Error('Should reject short description')
    })

    await runTest('POST /api/services - Invalid price', async () => {
      const response = await request('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          category: 'CITIZENSHIP',
          title: 'Test Service Title',
          description: 'This is a test service description that is longer than 50 characters.',
          price: -100,
          country: 'Test',
          countryCode: 'TC',
          features: ['Feature 1'],
        }),
      })
      if (response.ok) throw new Error('Should reject negative price')
    })

    await runTest('POST /api/services - Invalid country code', async () => {
      const response = await request('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          category: 'CITIZENSHIP',
          title: 'Test Service Title',
          description: 'This is a test service description that is longer than 50 characters.',
          price: 10000,
          country: 'Test',
          countryCode: 'INVALID',
          features: ['Feature 1'],
        }),
      })
      if (response.ok) throw new Error('Should reject invalid country code')
    })

    await runTest('POST /api/services - Valid service creation', async () => {
      const response = await request('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          category: 'BANKING',
          title: 'Test Banking Service API',
          description: 'This is a comprehensive test service description that meets the minimum 50 character requirement.',
          price: 5000,
          country: 'Switzerland',
          countryCode: 'CH',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          processingTime: '2-3 weeks',
          requirements: ['Requirement 1', 'Requirement 2'],
        }),
      })
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`HTTP ${response.status}: ${error}`)
      }
      const data = await response.json()
      if (!data.id) throw new Error('Missing service ID in response')
    })
  }

  // ============================================
  // SEARCH ENDPOINT
  // ============================================
  console.log('\n🔍 Search Endpoint:')

  await runTest('GET /api/search - Empty query', async () => {
    const response = await request('/api/search')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data.services)) throw new Error('Invalid response format')
  })

  await runTest('GET /api/search - Search by text', async () => {
    const response = await request('/api/search?q=Malta')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data.services)) throw new Error('Invalid response format')
  })

  await runTest('GET /api/search - Filter by category', async () => {
    const response = await request('/api/search?category=CITIZENSHIP')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data.services)) throw new Error('Invalid response format')
  })

  await runTest('GET /api/search - Filter by country', async () => {
    const response = await request('/api/search?country=MT')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data.services)) throw new Error('Invalid response format')
  })

  await runTest('GET /api/search - Filter by price range', async () => {
    const response = await request('/api/search?minPrice=100000&maxPrice=500000')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data.services)) throw new Error('Invalid response format')
  })

  await runTest('GET /api/search - Combined filters', async () => {
    const response = await request('/api/search?q=citizenship&category=CITIZENSHIP&minPrice=0&maxPrice=1000000')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data.services)) throw new Error('Invalid response format')
  })

  // ============================================
  // REVIEW ENDPOINT
  // ============================================
  console.log('\n⭐ Review Endpoint:')

  // Login as customer
  sessionCookie = ''
  const customerLogin = await request('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({
      email: 'customer@example.com',
      password: 'customer123',
    }),
  })

  if (customerLogin.ok) {
    await runTest('POST /api/reviews - Customer without purchase', async () => {
      const response = await request('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: 'clz1test123', // Non-existent service
          rating: 5,
          comment: 'This is a test review comment.',
        }),
      })
      if (response.status !== 404 && response.status !== 403) {
        throw new Error(`Expected 404/403, got ${response.status}`)
      }
    })

    await runTest('POST /api/reviews - Invalid rating', async () => {
      const response = await request('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: 'clz1test123',
          rating: 6, // Invalid - max is 5
          comment: 'This is a test review comment.',
        }),
      })
      if (response.ok) throw new Error('Should reject rating > 5')
    })

    await runTest('POST /api/reviews - Comment too short', async () => {
      const response = await request('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: 'clz1test123',
          rating: 5,
          comment: 'Short', // Less than 10 chars
        }),
      })
      if (response.ok) throw new Error('Should reject short comment')
    })
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Summary:\n')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total

  console.log(`Total tests: ${total}`)
  console.log(`✓ Passed: ${passed}`)
  console.log(`✗ Failed: ${failed}`)
  console.log(`Average duration: ${avgDuration.toFixed(0)}ms`)
  console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log('\n❌ Failed tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`)
    })
  }

  console.log('\n' + '='.repeat(60))
  console.log(failed === 0 ? '✅ All API tests passed!\n' : '❌ Some tests failed\n')

  process.exit(failed > 0 ? 1 : 0)
}

testApi().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})
