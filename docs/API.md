# 🔌 API Dokumentace

Kompletní dokumentace REST API endpointů pro The Globalists marketplace.

## 📋 Přehled

**Base URL:** `https://theglobalists.com/api` (produkce) nebo `http://localhost:3000/api` (development)

**Formát:** JSON

**Autentizace:** NextAuth session cookies nebo API tokens

## 🔐 Autentizace

### POST `/api/auth/signin`

Přihlášení uživatele.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  },
  "session": {
    "expires": "2024-02-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `401` - Nesprávné přihlašovací údaje
- `429` - Příliš mnoho pokusů

---

### POST `/api/auth/signup`

Registrace nového uživatele.

**Request:**
```json
{
  "email": "new@example.com",
  "password": "securePassword123",
  "name": "Jane Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "cuid124",
    "email": "new@example.com",
    "name": "Jane Doe",
    "role": "CUSTOMER"
  }
}
```

**Errors:**
- `400` - Validační chyba
- `409` - Email již existuje

---

### POST `/api/auth/signout`

Odhlášení uživatele.

**Response (200):**
```json
{
  "success": true
}
```

---

## 👤 Users

### GET `/api/user/me`

Získat aktuálního přihlášeného uživatele.

**Auth:** Required

**Response (200):**
```json
{
  "id": "cuid123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "CUSTOMER",
  "image": "https://...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PATCH `/api/user/me`

Aktualizovat profil.

**Auth:** Required

**Request:**
```json
{
  "name": "John Updated",
  "image": "https://new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "id": "cuid123",
  "name": "John Updated",
  "image": "https://new-avatar.jpg"
}
```

---

## 🏢 Providers

### POST `/api/providers`

Vytvořit provider profil.

**Auth:** Required (role: CUSTOMER)

**Request:**
```json
{
  "companyName": "Global Services Inc",
  "description": "Leading provider of citizenship services",
  "website": "https://globalservices.com",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "id": "cuid200",
  "userId": "cuid123",
  "companyName": "Global Services Inc",
  "subscriptionPlan": "FREE",
  "commissionRate": 0.10,
  "verificationStatus": "PENDING",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Note:** Automaticky updatne user role na `PROVIDER`

---

### GET `/api/providers/:id`

Získat provider detail.

**Response (200):**
```json
{
  "id": "cuid200",
  "companyName": "Global Services Inc",
  "description": "...",
  "subscriptionPlan": "VERIFIED",
  "verificationStatus": "VERIFIED",
  "services": [
    {
      "id": "svc1",
      "title": "Malta Citizenship",
      "price": 750000,
      "rating": 4.8
    }
  ],
  "stats": {
    "totalServices": 8,
    "totalSales": 42,
    "avgRating": 4.7
  }
}
```

---

### PATCH `/api/providers/me`

Aktualizovat vlastní provider profil.

**Auth:** Required (role: PROVIDER)

**Request:**
```json
{
  "description": "Updated description",
  "website": "https://new-website.com"
}
```

---

## 🛍️ Services

### GET `/api/services`

Seznam všech služeb s filtrováním.

**Query params:**
- `category` - ServiceCategory enum
- `country` - ISO kód země (CZ, MT, PT...)
- `minPrice` - Number
- `maxPrice` - Number
- `rating` - Number (min rating)
- `verified` - Boolean (pouze verified providers)
- `search` - String (fultext search)
- `page` - Number (default: 1)
- `limit` - Number (default: 12, max: 50)
- `sort` - `price_asc|price_desc|rating|newest`

**Example:**
```
GET /api/services?category=CITIZENSHIP&country=MT&verified=true&page=1
```

**Response (200):**
```json
{
  "services": [
    {
      "id": "svc1",
      "title": "Malta Citizenship by Investment",
      "slug": "malta-citizenship-investment",
      "category": "CITIZENSHIP",
      "price": 750000,
      "currency": "USD",
      "country": "Malta",
      "countryCode": "MT",
      "isPromoted": true,
      "provider": {
        "id": "prov1",
        "companyName": "Global Services Inc",
        "verificationStatus": "VERIFIED"
      },
      "stats": {
        "rating": 4.8,
        "reviewCount": 24,
        "viewCount": 1247
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 127,
    "pages": 11
  }
}
```

---

### GET `/api/services/:slug`

Detail služby.

**Response (200):**
```json
{
  "id": "svc1",
  "title": "Malta Citizenship by Investment",
  "slug": "malta-citizenship-investment",
  "description": "Full description...",
  "category": "CITIZENSHIP",
  "price": 750000,
  "country": "Malta",
  "countryCode": "MT",
  "features": [
    "EU Passport",
    "Visa-free travel to 180+ countries",
    "12-month processing"
  ],
  "requirements": [
    "Clean criminal record",
    "Proof of funds",
    "Health insurance"
  ],
  "processingTime": "12-14 months",
  "isPromoted": false,
  "provider": {
    "id": "prov1",
    "companyName": "Global Services Inc",
    "verificationStatus": "VERIFIED",
    "subscriptionPlan": "VERIFIED"
  },
  "stats": {
    "rating": 4.8,
    "reviewCount": 24,
    "viewCount": 1247,
    "purchaseCount": 12
  },
  "reviews": [
    {
      "id": "rev1",
      "rating": 5,
      "comment": "Excellent service!",
      "user": {
        "name": "John D.",
        "image": "..."
      },
      "createdAt": "2024-01-15T..."
    }
  ]
}
```

---

### POST `/api/services`

Vytvořit novou službu.

**Auth:** Required (role: PROVIDER)

**Request:**
```json
{
  "category": "CITIZENSHIP",
  "title": "Portugal Golden Visa",
  "description": "Detailed description...",
  "price": 280000,
  "country": "Portugal",
  "countryCode": "PT",
  "features": ["EU residency", "5-year path to citizenship"],
  "requirements": ["Investment proof", "Clean record"],
  "processingTime": "6-8 months",
  "status": "DRAFT"
}
```

**Response (201):**
```json
{
  "id": "svc2",
  "slug": "portugal-golden-visa",
  "status": "DRAFT",
  "createdAt": "2024-01-20T..."
}
```

---

### PATCH `/api/services/:id`

Aktualizovat službu.

**Auth:** Required (vlastník nebo admin)

**Request:**
```json
{
  "price": 290000,
  "status": "PUBLISHED"
}
```

---

### DELETE `/api/services/:id`

Smazat službu.

**Auth:** Required (vlastník nebo admin)

**Response (204):** No content

---

## ⭐ Reviews

### GET `/api/services/:serviceId/reviews`

Získat reviews pro službu.

**Query params:**
- `page` - Number
- `limit` - Number (default: 10)
- `sort` - `newest|helpful|rating`

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "rev1",
      "rating": 5,
      "comment": "Great service, highly recommend!",
      "user": {
        "name": "John D.",
        "image": "..."
      },
      "createdAt": "2024-01-15T...",
      "status": "PUBLISHED"
    }
  ],
  "stats": {
    "average": 4.8,
    "total": 24,
    "breakdown": {
      "5": 18,
      "4": 4,
      "3": 2,
      "2": 0,
      "1": 0
    }
  },
  "pagination": {
    "page": 1,
    "total": 24,
    "pages": 3
  }
}
```

---

### POST `/api/services/:serviceId/reviews`

Vytvořit review.

**Auth:** Required (musí koupit službu)

**Request:**
```json
{
  "rating": 5,
  "comment": "Excellent service, professional team!"
}
```

**Response (201):**
```json
{
  "id": "rev2",
  "rating": 5,
  "comment": "...",
  "status": "PUBLISHED",
  "createdAt": "2024-01-20T..."
}
```

**Errors:**
- `400` - Již jste hodnotili
- `403` - Musíte nejdřív zakoupit službu

---

## 💳 Payments & Checkout

### POST `/api/checkout/session`

Vytvořit Stripe checkout session.

**Auth:** Required

**Request:**
```json
{
  "serviceId": "svc1"
}
```

**Response (200):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Client flow:**
```javascript
// Frontend
const response = await fetch('/api/checkout/session', {
  method: 'POST',
  body: JSON.stringify({ serviceId: 'svc1' })
})
const { url } = await response.json()
window.location.href = url // Redirect na Stripe
```

---

### GET `/api/transactions`

Seznam transakcí (vlastní).

**Auth:** Required

**Query params:**
- `type` - `purchases|sales` (pro providery)
- `status` - TransactionStatus
- `page`, `limit`

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "txn1",
      "service": {
        "id": "svc1",
        "title": "Malta Citizenship"
      },
      "amount": 825000,
      "commissionAmount": 75000,
      "status": "COMPLETED",
      "createdAt": "2024-01-15T...",
      "completedAt": "2024-01-15T..."
    }
  ],
  "pagination": {...}
}
```

---

### GET `/api/transactions/:id`

Detail transakce.

**Auth:** Required (buyer nebo seller)

**Response (200):**
```json
{
  "id": "txn1",
  "service": {
    "id": "svc1",
    "title": "Malta Citizenship by Investment"
  },
  "buyer": {
    "email": "buyer@example.com",
    "name": "John Buyer"
  },
  "seller": {
    "companyName": "Global Services Inc"
  },
  "amount": 825000,
  "commissionAmount": 75000,
  "commissionRate": 0.10,
  "sellerAmount": 750000,
  "currency": "USD",
  "status": "COMPLETED",
  "stripePaymentIntentId": "pi_...",
  "createdAt": "2024-01-15T...",
  "completedAt": "2024-01-15T..."
}
```

---

## 📊 Subscriptions

### POST `/api/subscriptions/checkout`

Upgrade na VERIFIED plán.

**Auth:** Required (role: PROVIDER)

**Response (200):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/..."
}
```

---

### POST `/api/subscriptions/portal`

Customer portal pro správu předplatného.

**Auth:** Required (role: PROVIDER)

**Response (200):**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

---

### GET `/api/subscriptions/status`

Status předplatného.

**Auth:** Required (role: PROVIDER)

**Response (200):**
```json
{
  "plan": "VERIFIED",
  "status": "ACTIVE",
  "currentPeriodEnd": "2024-02-15T...",
  "cancelAtPeriodEnd": false
}
```

---

## 🎯 Promotions

### POST `/api/promotions`

Zakoupit promoci pro službu.

**Auth:** Required (role: PROVIDER)

**Request:**
```json
{
  "serviceId": "svc1"
}
```

**Response (200):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/..."
}
```

**Po úspěšném zaplacení:**
- Služba bude promoted po dobu 30 dní
- Automaticky pinned na top kategorie
- Highlighted border

---

### GET `/api/promotions/active`

Seznam aktivních promocí (provider).

**Auth:** Required (role: PROVIDER)

**Response (200):**
```json
{
  "promotions": [
    {
      "id": "promo1",
      "service": {
        "id": "svc1",
        "title": "Malta Citizenship"
      },
      "category": "CITIZENSHIP",
      "startDate": "2024-01-01T...",
      "expiresAt": "2024-01-31T...",
      "daysRemaining": 15,
      "stats": {
        "views": 3421,
        "clicks": 234
      }
    }
  ]
}
```

---

## 🔔 Webhooks

### POST `/api/webhooks/stripe`

Stripe webhook endpoint.

**Note:** Pouze pro Stripe servers

**Events handled:**
- `payment_intent.succeeded` - Dokončená platba
- `payment_intent.payment_failed` - Neúspěšná platba
- `customer.subscription.created` - Nové předplatné
- `customer.subscription.updated` - Změna předplatného
- `customer.subscription.deleted` - Zrušené předplatné
- `account.updated` - Stripe Connect account update

**Verifikace:**
```typescript
const sig = request.headers['stripe-signature']
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
)
```

---

## 📈 Analytics

### GET `/api/analytics/dashboard`

Provider dashboard analytics.

**Auth:** Required (role: PROVIDER)

**Query params:**
- `period` - `7d|30d|90d|1y`

**Response (200):**
```json
{
  "overview": {
    "totalRevenue": 1080000,
    "totalSales": 42,
    "avgOrderValue": 25714,
    "conversionRate": 3.2
  },
  "salesByDay": [
    { "date": "2024-01-15", "sales": 2, "revenue": 50000 }
  ],
  "topServices": [
    {
      "id": "svc1",
      "title": "Malta Citizenship",
      "sales": 12,
      "revenue": 900000
    }
  ],
  "recentActivity": [...]
}
```

---

## 🔍 Search

### GET `/api/search`

Globální search napříč službami.

**Query params:**
- `q` - Search query (required)
- `category` - Filter by category
- `page`, `limit`

**Response (200):**
```json
{
  "results": [
    {
      "id": "svc1",
      "title": "Malta Citizenship",
      "highlight": "...Malta <mark>Citizenship</mark> by Investment...",
      "score": 0.95
    }
  ],
  "total": 23,
  "took": 45 // ms
}
```

---

## 👨‍💼 Admin Endpoints

**Note:** Všechny vyžadují `role: ADMIN`

### GET `/api/admin/users`

Seznam všech uživatelů.

**Query params:**
- `role`, `page`, `limit`, `search`

---

### PATCH `/api/admin/users/:id`

Upravit uživatele.

**Request:**
```json
{
  "role": "PROVIDER"
}
```

---

### GET `/api/admin/services/pending`

Služby čekající na schválení.

---

### PATCH `/api/admin/services/:id/verify`

Schválit/zamítnout službu.

**Request:**
```json
{
  "action": "approve" | "reject",
  "reason": "Optional rejection reason"
}
```

---

### GET `/api/admin/stats`

Systémové statistiky.

**Response (200):**
```json
{
  "users": {
    "total": 1247,
    "customers": 1000,
    "providers": 245,
    "admins": 2
  },
  "services": {
    "total": 892,
    "published": 654,
    "draft": 200,
    "pending": 38
  },
  "transactions": {
    "total": 432,
    "completed": 398,
    "pending": 34,
    "volume": 12450000
  },
  "revenue": {
    "total": 1245000,
    "thisMonth": 125000,
    "lastMonth": 98000
  }
}
```

---

## 🚨 Error Responses

Všechny error responses následují formát:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error codes:

| Kód | HTTP | Popis |
|-----|------|-------|
| `UNAUTHORIZED` | 401 | Nepřihlášený uživatel |
| `FORBIDDEN` | 403 | Nedostatečná oprávnění |
| `NOT_FOUND` | 404 | Zdroj nenalezen |
| `VALIDATION_ERROR` | 400 | Chyba validace |
| `CONFLICT` | 409 | Konflikt (např. email exists) |
| `RATE_LIMIT` | 429 | Příliš mnoho požadavků |
| `INTERNAL_ERROR` | 500 | Serverová chyba |
| `STRIPE_ERROR` | 402 | Platební chyba |

---

## 🔒 Rate Limiting

**Limity:**
- Anonymous: 60 req/min
- Authenticated: 300 req/min
- Admin: 1000 req/min

**Headers:**
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 245
X-RateLimit-Reset: 1642345678
```

**Při překročení:**
```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

---

## 📝 Příklady použití

### JavaScript/TypeScript

```typescript
// Fetch services
const response = await fetch('/api/services?category=CITIZENSHIP&verified=true')
const data = await response.json()

// Create service (as provider)
const newService = await fetch('/api/services', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'CITIZENSHIP',
    title: 'Malta Citizenship',
    price: 750000,
    // ...
  })
})

// Checkout
const checkout = await fetch('/api/checkout/session', {
  method: 'POST',
  body: JSON.stringify({ serviceId: 'svc1' })
})
const { url } = await checkout.json()
window.location.href = url
```

### cURL

```bash
# Get services
curl https://theglobalists.com/api/services?category=CITIZENSHIP

# Create review (with auth)
curl -X POST https://theglobalists.com/api/services/svc1/reviews \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "comment": "Great!"}'
```

---

## 🧪 Testing

### Test API s Postman

Importujte kolekci:

```json
{
  "info": { "name": "The Globalists API" },
  "auth": {
    "type": "bearer",
    "bearer": [{ "key": "token", "value": "{{sessionToken}}" }]
  },
  "item": [...]
}
```

### Mock data

Pro development:

```bash
npm run db:seed
```

---

**Další informace:**
- [Database Schema](./DATABASE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Features](./FEATURES.md)
