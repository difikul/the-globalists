# 👨‍💻 Development Guide

Průvodce vývojem pro The Globalists marketplace s interaktivním přístupem a checkpointy.

## 🎯 Filosofie vývoje

Tento projekt je navržen jako **interaktivní MVP build** s důrazem na:

- ✅ **Postupné kroky** s pravidelnými checkpointy
- ✅ **Validace každého kroku** před pokračováním
- ✅ **Průběžné testování** funkcionalit
- ✅ **Dokumentace postupu** v DEVELOPMENT_LOG.md
- ✅ **Možnost přerušení** a pokračování kdykoliv

## 🚨 Pravidla interaktivního módu

### MUSÍTE:
1. **Zastavit na každém checkpointu** a počkat na vstup
2. **Ptát se před vytvořením účtů** - provést uživatele registrací
3. **Požadovat credentials krok za krokem** - nikdy nepředpokládat, že existují
4. **Validovat vstupy** před jejich použitím
5. **Vysvětlit PROČ** něco potřebujete
6. **Zobrazit progress** po hlavních krocích
7. **Řešit chyby elegantně** - pomoct s troubleshootingem
8. **Umožnit přestávky** - často ukládat progress

### Formát checkpointu:

```
🛑 CHECKPOINT [N]: [Název]
━━━━━━━━━━━━━━━━━━━━━━
Potřebuji: [Co potřebujete]
Proč: [Stručný důvod]
Jak získat: [Odkud to vzít - URL pokud je to možné]
Formát: [Očekávaný formát]
━━━━━━━━━━━━━━━━━━━━━━
[Čekat na vstup uživatele]
```

## 📅 Časový harmonogram (14 dní)

| Fáze | Dny | Klíčové výstupy |
|------|-----|-----------------|
| **Phase 1: Foundation** | 1-3 | Setup, Auth, Základní UI |
| **Phase 2: Core Features** | 4-7 | CRUD, Search, Reviews |
| **Phase 3: Payments** | 8-10 | Stripe, Komisní systém |
| **Phase 4: Polish** | 11-14 | UI/UX, Email, Testing |

## 📋 Fáze vývoje

### Phase 1: Foundation (Dny 1-3)

#### 🛑 CHECKPOINT 1: Prostředí

**Kontrola:**
```bash
# Node.js 20+
node --version

# Docker
docker --version
docker-compose --version

# Git
git --version
```

**Akce:**
- Vytvořit Next.js projekt
- Nastavit TypeScript, ESLint, Prettier
- Nainstalovat základní dependencies

#### 🛑 CHECKPOINT 2: Database Setup

**Potřebuji:** PostgreSQL credentials
**Proč:** Pro připojení k databázi
**Výchozí:** `postgres/[user-password]/globalists`
**Formát:** `DATABASE_URL=postgresql://user:pass@localhost:5432/dbname`

**Akce:**
- Vytvořit `docker-compose.yml`
- Spustit PostgreSQL + Redis
- Vytvořit Prisma schema
- Spustit první migrace

#### 🛑 CHECKPOINT 3: NextAuth Secret

**Potřebuji:** Bezpečný náhodný řetězec
**Jak získat:** `openssl rand -base64 32`
**Formát:** `NEXTAUTH_SECRET=[výstup]`

**Akce:**
- Nastavit NextAuth.js v5
- Implementovat email/password login
- Vytvořit základní auth flow
- Testovat registraci a login

#### Výstupy Phase 1:
- ✅ Fungující dev prostředí
- ✅ Databáze připojená
- ✅ Auth flow funkční
- ✅ Základní layout (Header, Footer)
- ✅ Tailwind + Shadcn/ui nastaveno

**Git commit:**
```bash
git add .
git commit -m "feat: initial project setup with auth"
```

---

### Phase 2: Core Features (Dny 4-7)

#### Den 4: Provider System

**Úkoly:**
- Provider registrace flow
- Provider profile stránka
- Provider dashboard layout
- Role management (CUSTOMER/PROVIDER/ADMIN)

**Test:**
```bash
# Registrovat se jako provider
# Vyplnit company profile
# Ověřit redirect na dashboard
```

#### Den 5: Service CRUD

**Úkoly:**
- Create service form s validací
- Edit/Delete funkcionalita
- Draft/Published status
- Image upload (nebo placeholder)

**Test:**
```bash
# Vytvořit draft službu
# Publikovat službu
# Editovat službu
# Smazat službu
```

#### Den 6: Browse & Search

**Úkoly:**
- Homepage s hero + category cards
- Category pages s filtrováním
- Search functionality
- Service detail page
- Pagination (12 per page)

**Filtry:**
- Kategorie (6 typů)
- Země
- Cena (min/max)
- Rating
- Verified badge

**Test:**
```bash
# Procházet kategorie
# Filtrovat podle země
# Vyhledat službu
# Zobrazit detail
```

#### Den 7: Review System

**Úkoly:**
- Review submission form
- Rating display (stars)
- Review listing s paginací
- Moderace (admin)
- Průměrné hodnocení kalkulace

**Test:**
```bash
# Zanechat review jako customer
# Zobrazit reviews na service detail
# Moderovat review jako admin
```

**Git commit:**
```bash
git add .
git commit -m "feat: core marketplace features (services, search, reviews)"
```

---

### Phase 3: Payments (Dny 8-10)

#### 🛑 CHECKPOINT 4: Stripe Setup

**Potřebuji:** Stripe účet + API klíče
**Kroky:**
1. Registrace: https://dashboard.stripe.com/register
2. Získat klíče: https://dashboard.stripe.com/test/apikeys
3. Aktivovat Connect: https://dashboard.stripe.com/settings/connect
4. Vytvořit webhook: `http://localhost:3000/api/webhooks/stripe`

**Poskytnout:**
```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Den 8: Stripe Connect

**Úkoly:**
- Provider onboarding flow
- Stripe Connect Account Link
- Onboarding status check
- Dashboard s balance

**Test:**
```bash
# Začít onboarding jako provider
# Dokončit Stripe formulář
# Ověřit connected account status
```

#### Den 9: Checkout & Payments

**Úkoly:**
- Service checkout page
- Stripe Payment Intent
- Webhook handler (`/api/webhooks/stripe`)
- Commission splitting logic
- Transaction záznam v DB

**Logika provize:**
```typescript
const commissionRate = provider.subscriptionPlan === 'VERIFIED' ? 0.05 : 0.10
const commissionAmount = servicePrice * commissionRate
const sellerAmount = servicePrice - commissionAmount

// Stripe Transfer to Connected Account
await stripe.transfers.create({
  amount: sellerAmount * 100, // cents
  currency: 'usd',
  destination: provider.stripeAccountId,
  transfer_group: paymentIntentId,
})
```

**Test:**
```bash
# Použít test kartu: 4242 4242 4242 4242
# Dokončit checkout
# Ověřit transakci v DB
# Zkontrolovat balance v Stripe Dashboard
```

#### Den 10: Subscriptions & Promotions

**Úkoly:**
- Subscription upgrade flow (FREE → VERIFIED)
- Stripe Subscription billing
- Promotion purchase ($300)
- Pin service logic (30 dní)
- Auto-expire promotions (cron job)

**Test:**
```bash
# Upgradovat na VERIFIED
# Ověřit snížení provize na 5%
# Zakoupit promoci
# Ověřit pin na kategoriální stránce
```

**Git commit:**
```bash
git add .
git commit -m "feat: stripe payments, subscriptions, and promotions"
```

---

### Phase 4: Polish (Dny 11-14)

#### 🛑 CHECKPOINT 5: Email Setup

**Potřebuji:** Resend účet + API klíč
**Kroky:**
1. Registrace: https://resend.com/signup
2. Získat klíč: https://resend.com/api-keys
3. Ověřit doménu (volitelné pro dev)

**Poskytnout:**
```env
RESEND_API_KEY=re_...
FROM_EMAIL=onboarding@resend.dev
```

#### Den 11: Email Notifications

**Úkoly:**
- Welcome email (po registraci)
- Purchase confirmation (kupující)
- Sale notification (prodávající)
- Subscription reminder
- Promotion expiration alert

**Template structure:**
```
/src/emails
  /templates
    - welcome.tsx
    - purchase-confirmation.tsx
    - sale-notification.tsx
```

#### Den 12: UI/UX Polish

**Úkoly:**
- Responsive design (mobile/tablet)
- Loading states (skeletons)
- Error handling & toasts
- Prázdné stavy
- Accessibility (a11y)
- SEO meta tags

**Kontrola responsive:**
```
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px
```

#### Den 13: Redis Caching

**Úkoly:**
- Cache popular services
- Cache category stats
- Cache provider profiles
- Cache invalidation strategy

**Příklad:**
```typescript
// Cache service detail (5 min)
const cacheKey = `service:${id}`
const cached = await redis.get(cacheKey)

if (cached) return JSON.parse(cached)

const service = await prisma.service.findUnique(...)
await redis.setex(cacheKey, 300, JSON.stringify(service))

return service
```

#### Den 14: Testing & Launch Prep

**Unit tests:**
```bash
# Instalace
npm install -D vitest @testing-library/react

# Testy
/src/__tests__
  - auth.test.ts
  - service.test.ts
  - payment.test.ts
```

**E2E testy:**
```bash
# Instalace
npm install -D @playwright/test

# Scénáře
/e2e
  - auth.spec.ts
  - checkout.spec.ts
  - provider-flow.spec.ts
```

#### 🛑 CHECKPOINT 6: Pre-Launch

**Ověření:**
- ✅ Všechny testy prochází?
- ✅ Platby fungují?
- ✅ Emaily se odesílají?
- ✅ Mobile responsive?
- ✅ Error handling správný?

**Produkce:**
- Název domény?
- Hosting? (Vercel/Railway/jiné)
- Databáze? (Neon/Supabase/jiné)
- Stripe live mode keys?
- Environment variables připraveny?

**Git commit:**
```bash
git add .
git commit -m "feat: ui polish, caching, and testing"
git tag v1.0.0
```

---

## 🔄 Git Workflow

### Konvence commitů

```bash
feat: nová funkcionalita
fix: oprava bugu
docs: dokumentace
style: formátování
refactor: refaktoring kódu
test: přidání testů
chore: údržba
```

### Branch strategy

```
main          # Produkce
├── develop   # Development
├── feature/* # Nové featury
└── hotfix/*  # Kritické opravy
```

## 🧪 Testing Strategy

### Co testovat

**Unit:**
- Utility funkce
- Validační schema
- Business logika

**Integration:**
- API endpoints
- Database operations
- Stripe webhooks

**E2E:**
- Auth flow
- Service creation
- Checkout process
- Provider dashboard

### Test coverage cíl

- **Kritické cesty:** 90%+
- **Business logika:** 80%+
- **UI komponenty:** 60%+

## 📊 Progress Tracking

### DEVELOPMENT_LOG.md

Po každé session aktualizujte:

```markdown
# Development Log

## Session 1 - 2024-01-15
- ✅ Dokončeno: Project setup, database migrations
- 🚧 V průběhu: NextAuth integration
- 📝 Poznámky: Používáme NextAuth v5 beta
- ⏭️ Další kroky: Dokončit auth flow

## Session 2 - 2024-01-16
...
```

## 🔧 MCP Tools Usage

Využijte dostupné MCP servery:

```bash
# Stripe testing
@stripe/mcp - Test payments without dashboard

# Database management
prisma mcp - Visual schema editing

# Redis operations
@modelcontextprotocol/server-redis - Cache debugging

# Email testing
Resend MCP - Test email templates

# Git operations
Git MCP - Version control automation
```

## 💡 Best Practices

1. **Commit často** - minimálně po každém checkpointu
2. **Test průběžně** - nezvyšuj technical debt
3. **Dokumentuj změny** - budoucí já ti poděkuje
4. **Code review** - aspoň peer review před mergem
5. **Security first** - nikdy necommituj .env soubory

## 🆘 Troubleshooting

### Časté problémy

**Databáze se nepřipojuje:**
```bash
docker-compose down -v
docker-compose up -d
npx prisma migrate dev
```

**Stripe webhook selhává:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Build fails:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Další zdroje

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Stripe Connect Guide](https://stripe.com/docs/connect/enable-payment-acceptance-guide)
- [Tailwind UI](https://tailwindui.com/)

---

**Ready to code?** 🚀 Začněte s [Setup Guide](./SETUP.md) a postupujte podle checkpointů!
