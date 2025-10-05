# The Globalists - Claude Project Context

## 📋 Projekt

**Název:** The Globalists
**Typ:** B2B/B2C Marketplace pro mezinárodní služby
**GitHub:** https://github.com/difikul/the-globalists
**Stav:** Phase 2 - Core Features (Part 1) ✅ DOKONČENO

## 🎯 O projektu

Marketplace spojující poskytovatele a zákazníky v oblasti mezinárodních služeb:
- 🛂 Občanství (Citizenship)
- 🏠 Rezidence (Residency)
- 🏢 Založení společnosti (Company Incorporation)
- 🏦 Banking
- 🛡️ Pojištění (Insurance)
- 📦 Přeprava (Shipping)

## 💰 Business Model

| Plán | Měsíční poplatek | Provize | Výhody |
|------|------------------|---------|--------|
| FREE | $0 | 10% | Základní listing |
| VERIFIED | $100/měsíc | 5% | Ověřený badge + nižší provize |
| PROMOTION | $300 (jednorázově) | - | Pin služby na 30 dní |

## 🛠 Tech Stack

**Frontend:**
- Next.js 15 (App Router, Turbopack)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- TanStack Query
- Zustand

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL 16
- Redis 7

**Auth & Payments:**
- NextAuth.js v5 (Credentials Provider)
- Stripe Connect
- Resend (Email)

**Infrastructure:**
- Docker Compose (local dev)

## 📊 Databázové schéma

11 modelů:
- **User** - uživatelé (CUSTOMER/PROVIDER/ADMIN)
- **Provider** - profily poskytovatelů
- **Service** - nabízené služby
- **Transaction** - transakce s provizemi
- **Subscription** - měsíční předplatné
- **Promotion** - propagace služeb
- **Review** - hodnocení služeb
- **Account, Session, VerificationToken** (NextAuth)

## 🚀 Quick Start

```bash
# Instalace
npm install

# Databáze
docker-compose up -d

# Migrace & Seed
npx prisma migrate dev
npm run db:seed

# Dev server
npm run dev  # http://localhost:3001
```

## 📧 Testovací účty

```
Admin:    admin@theglobalists.com    / admin123
Provider: provider@example.com      / provider123
Customer: customer@example.com      / customer123
```

## ✅ Phase 1 - Foundation (DOKONČENO)

- [x] Next.js 15 setup
- [x] Prisma schema (11 modelů)
- [x] NextAuth.js v5 konfigurace
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Shadcn/ui komponenty
- [x] Auth pages (login/register)
- [x] Základní layout (Header, Footer)
- [x] Homepage s kategoriemi
- [x] Seed script s test daty
- [x] Git repository setup

## 📝 Phase 2 - Core Features (Part 1) (DOKONČENO)

- [x] Provider dashboard layout
- [x] Dashboard overview (provider & customer stats)
- [x] Service CRUD - Create s validací
- [x] Service CRUD - List služeb
- [x] Category pages pro procházení služeb
- [x] Service detail page s reviews
- [x] API endpoints (/api/services)
- [x] Auth middleware pro ochranu routes
- [ ] Service CRUD - Edit/Delete (TODO)
- [ ] Search funkcionalita (TODO)
- [ ] Review creation form (TODO)

## 📁 Struktura projektu

```
the-globalists/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, register
│   │   ├── (marketing)/      # Public pages
│   │   ├── (dashboard)/      # Provider area (TODO)
│   │   └── api/              # API routes
│   ├── components/
│   │   └── ui/               # Shadcn components
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   └── utils.ts
│   └── types/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── docs/                     # Dokumentace
└── docker-compose.yml
```

## 🔧 Užitečné příkazy

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build pro produkci
npm run start            # Start produkční server

# Database
npx prisma studio        # Prisma GUI
npx prisma migrate dev   # Nová migrace
npm run db:seed          # Seed databáze
npx prisma generate      # Regenerovat client

# Docker
docker-compose up -d     # Start služby
docker-compose down      # Stop služby
docker-compose logs -f   # Zobrazit logy
```

## 🌐 Environment Variables

Vyžadované v `.env.local`:

```env
DATABASE_URL="postgresql://postgres:globalists2024@localhost:5432/globalists"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="[vygenerováno]"
NEXTAUTH_URL="http://localhost:3000"

# TODO: Přidat pro Phase 3
STRIPE_PUBLIC_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
RESEND_API_KEY=""
FROM_EMAIL=""
```

## 📚 Dokumentace

Veškerá dokumentace je v adresáři `/docs`:
- `SETUP.md` - Instalační průvodce
- `DATABASE.md` - Databázové schéma
- `DEVELOPMENT.md` - Vývojový proces
- `FEATURES.md` - Funkční specifikace
- `API.md` - API dokumentace
- `DEPLOYMENT.md` - Deployment guide

## 🎯 Komunikace s AI

**Jazyk:** Vždy komunikuj v češtině.

**Kontext:**
- Projekt je ve fázi aktivního vývoje
- Používáme interaktivní přístup s checkpointy
- Vždy se ptej před velkými změnami
- Commituj často s conventional commits

**Dostupné MCP servery:**
- Stripe MCP: `@stripe/mcp`
- Prisma MCP: `prisma mcp`
- Redis MCP: `@modelcontextprotocol/server-redis`
- Resend MCP: Email testing
- Git MCP: Version control

---

**Poslední aktualizace:** 2025-10-05
**Verze:** Phase 1 Complete
**Autor:** Claude Code + difikul
