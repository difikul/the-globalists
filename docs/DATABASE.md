# 🗄️ Databázové schéma

Dokumentace databázové architektury pro The Globalists marketplace.

## 📊 ER Diagram

```
User ──┬── Provider ──┬── Service ──┬── Transaction
       │              │             ├── Review
       │              │             └── Promotion
       │              └── Subscription
       └── Review
       └── Transaction (jako buyer)
```

## 🔷 Modely

### User

Základní uživatelský model pro všechny role.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          UserRole  @default(CUSTOMER)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  provider      Provider?
  reviews       Review[]
  purchases     Transaction[] @relation("Buyer")

  // NextAuth
  accounts      Account[]
  sessions      Session[]
}

enum UserRole {
  CUSTOMER
  PROVIDER
  ADMIN
}
```

**Indexy:**
- `email` (unique)
- `role`

### Provider

Profil poskytovatele služeb.

```prisma
model Provider {
  id                  String              @id @default(cuid())
  userId              String              @unique

  companyName         String
  description         String?             @db.Text
  website             String?
  phone               String?

  subscriptionPlan    SubscriptionPlan    @default(FREE)
  commissionRate      Float               @default(0.10) // 10% pro FREE
  verificationStatus  VerificationStatus  @default(PENDING)

  // Stripe Connect
  stripeAccountId     String?             @unique
  stripeOnboarded     Boolean             @default(false)

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  // Relations
  user                User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  services            Service[]
  subscriptions       Subscription[]
  sales               Transaction[]       @relation("Seller")

  @@index([subscriptionPlan])
  @@index([verificationStatus])
}

enum SubscriptionPlan {
  FREE      // 10% commission
  VERIFIED  // 5% commission + badge
}

enum VerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}
```

**Indexy:**
- `userId` (unique)
- `stripeAccountId` (unique)
- `subscriptionPlan`
- `verificationStatus`

### Service

Nabízené služby.

```prisma
model Service {
  id              String          @id @default(cuid())
  providerId      String

  category        ServiceCategory
  title           String
  description     String          @db.Text
  price           Float
  currency        String          @default("USD")

  // Lokace
  country         String
  countryCode     String          // ISO 3166-1 alpha-2

  // Features
  features        Json            // Array of features
  processingTime  String?         // "2-3 months"
  requirements    Json?           // Array of requirements

  // Visibility
  status          ServiceStatus   @default(DRAFT)
  isPromoted      Boolean         @default(false)

  // SEO
  slug            String          @unique
  metaTitle       String?
  metaDescription String?

  // Stats
  viewCount       Int             @default(0)
  purchaseCount   Int             @default(0)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  publishedAt     DateTime?

  // Relations
  provider        Provider        @relation(fields: [providerId], references: [id], onDelete: Cascade)
  transactions    Transaction[]
  reviews         Review[]
  promotion       Promotion?

  @@index([category])
  @@index([country])
  @@index([status])
  @@index([isPromoted])
  @@index([slug])
  @@index([providerId])
}

enum ServiceCategory {
  CITIZENSHIP
  RESIDENCY
  COMPANY_INCORPORATION
  BANKING
  INSURANCE
  SHIPPING
}

enum ServiceStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  UNDER_REVIEW
}
```

**Indexy:**
- `slug` (unique)
- `category`
- `country`
- `status`
- `isPromoted`
- `providerId`

### Transaction

Záznamy o nákupech.

```prisma
model Transaction {
  id                      String            @id @default(cuid())

  serviceId               String
  buyerId                 String
  sellerId                String

  // Amounts
  amount                  Float             // Celková částka
  commissionAmount        Float             // Provize platformy
  commissionRate          Float             // Použitá sazba (5% nebo 10%)
  sellerAmount            Float             // Částka pro prodejce

  currency                String            @default("USD")

  // Stripe
  stripePaymentIntentId   String            @unique
  stripeTransferId        String?           @unique

  // Status
  status                  TransactionStatus @default(PENDING)

  // Metadata
  metadata                Json?

  createdAt               DateTime          @default(now())
  updatedAt               DateTime          @updatedAt
  completedAt             DateTime?

  // Relations
  service                 Service           @relation(fields: [serviceId], references: [id])
  buyer                   User              @relation("Buyer", fields: [buyerId], references: [id])
  seller                  Provider          @relation("Seller", fields: [sellerId], references: [id])

  @@index([buyerId])
  @@index([sellerId])
  @@index([serviceId])
  @@index([status])
  @@index([createdAt])
}

enum TransactionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}
```

**Indexy:**
- `stripePaymentIntentId` (unique)
- `stripeTransferId` (unique)
- `buyerId`
- `sellerId`
- `serviceId`
- `status`
- `createdAt`

### Subscription

Měsíční předplatné poskytovatelů.

```prisma
model Subscription {
  id                    String             @id @default(cuid())
  providerId            String

  plan                  SubscriptionPlan

  // Stripe
  stripeSubscriptionId  String             @unique
  stripePriceId         String
  stripeCustomerId      String

  // Status
  status                SubscriptionStatus @default(ACTIVE)

  // Billing
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  cancelAtPeriodEnd     Boolean            @default(false)
  canceledAt            DateTime?

  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  // Relations
  provider              Provider           @relation(fields: [providerId], references: [id], onDelete: Cascade)

  @@index([providerId])
  @@index([status])
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  INCOMPLETE
  TRIALING
}
```

**Indexy:**
- `stripeSubscriptionId` (unique)
- `providerId`
- `status`

### Promotion

Propagace služeb (pin na 30 dní).

```prisma
model Promotion {
  id          String   @id @default(cuid())
  serviceId   String   @unique

  category    ServiceCategory
  pricePaid   Float    // $300

  startDate   DateTime @default(now())
  expiresAt   DateTime

  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@index([category])
  @@index([expiresAt])
  @@index([isActive])
}
```

**Indexy:**
- `serviceId` (unique)
- `category`
- `expiresAt`
- `isActive`

### Review

Hodnocení služeb zákazníky.

```prisma
model Review {
  id          String   @id @default(cuid())

  serviceId   String
  userId      String

  rating      Int      // 1-5
  comment     String?  @db.Text

  // Moderace
  status      ReviewStatus @default(PUBLISHED)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Jeden uživatel může hodnotit službu pouze jednou
  @@unique([serviceId, userId])
  @@index([serviceId])
  @@index([userId])
  @@index([rating])
}

enum ReviewStatus {
  PENDING
  PUBLISHED
  REJECTED
}
```

**Indexy:**
- `[serviceId, userId]` (unique composite)
- `serviceId`
- `userId`
- `rating`

## 🔗 Vztahy mezi entitami

### One-to-One
- `User` ↔ `Provider` (jeden user může být max jeden provider)
- `Service` ↔ `Promotion` (jedna služba může mít max jednu aktivní promoci)

### One-to-Many
- `Provider` → `Service[]` (provider může mít více služeb)
- `Provider` → `Subscription[]` (historie předplatného)
- `Service` → `Transaction[]` (více nákupů jedné služby)
- `Service` → `Review[]` (více hodnocení)
- `User` → `Review[]` (user může hodnotit více služeb)
- `User` → `Transaction[]` (jako buyer)
- `Provider` → `Transaction[]` (jako seller)

## 📈 Agregace a výpočty

### Průměrné hodnocení služby

```typescript
const serviceWithRating = await prisma.service.findUnique({
  where: { id: serviceId },
  include: {
    reviews: {
      where: { status: 'PUBLISHED' },
      select: { rating: true }
    }
  }
})

const avgRating = serviceWithRating.reviews.length > 0
  ? serviceWithRating.reviews.reduce((acc, r) => acc + r.rating, 0) / serviceWithRating.reviews.length
  : 0
```

### Celkový příjem providera

```typescript
const totalRevenue = await prisma.transaction.aggregate({
  where: {
    sellerId: providerId,
    status: 'COMPLETED'
  },
  _sum: {
    sellerAmount: true
  }
})
```

### Aktivní promoce v kategorii

```typescript
const promotedServices = await prisma.service.findMany({
  where: {
    category: 'CITIZENSHIP',
    isPromoted: true,
    promotion: {
      isActive: true,
      expiresAt: {
        gte: new Date()
      }
    }
  },
  include: {
    promotion: true,
    provider: true
  },
  orderBy: {
    promotion: {
      startDate: 'desc'
    }
  }
})
```

## 🎯 Optimalizace

### Composite indexy pro časté dotazy

```prisma
@@index([category, status, isPromoted]) // Filtrování služeb
@@index([providerId, status]) // Provider dashboard
@@index([sellerId, status, createdAt]) // Transakce providera
```

### Full-text search

Pro produkční použití zvažte:
- PostgreSQL Full-Text Search
- Elasticsearch pro pokročilé vyhledávání
- Algolia jako managed řešení

## 🔄 Migrace

### Vytvoření migrace

```bash
npx prisma migrate dev --name add_feature_name
```

### Reset databáze (development)

```bash
npx prisma migrate reset
```

### Produkční migrace

```bash
npx prisma migrate deploy
```

## 🧪 Seed data

Příklad seed scriptu v `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@theglobalists.com',
      role: 'ADMIN',
      name: 'Admin User'
    }
  })

  // Test provider
  const provider = await prisma.provider.create({
    data: {
      userId: admin.id,
      companyName: 'Global Services Inc',
      subscriptionPlan: 'VERIFIED',
      commissionRate: 0.05,
      verificationStatus: 'VERIFIED',
      stripeOnboarded: true
    }
  })

  // Test services
  await prisma.service.createMany({
    data: [
      {
        providerId: provider.id,
        category: 'CITIZENSHIP',
        title: 'Malta Citizenship by Investment',
        description: 'Fast-track citizenship program',
        price: 750000,
        country: 'Malta',
        countryCode: 'MT',
        status: 'PUBLISHED',
        slug: 'malta-citizenship-investment',
        features: JSON.stringify(['EU Passport', 'Visa-free travel', '12-month process'])
      }
    ]
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

**Další kroky:**
- [Development Guide](./DEVELOPMENT.md)
- [API Dokumentace](./API.md)
- [Setup Guide](./SETUP.md)
