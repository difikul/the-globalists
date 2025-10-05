# 🚀 Deployment Guide

Průvodce nasazením The Globalists marketplace do produkčního prostředí.

## 📋 Předpoklady

Před deploymentem ověřte:

- ✅ Všechny testy procházejí
- ✅ Build je úspěšný lokálně
- ✅ Environment proměnné připraveny
- ✅ Stripe v live mode
- ✅ Databáze produkční připravena
- ✅ Doména nakoupena a nakonfigurována

## 🌐 Doporučené platformy

### Option 1: Vercel (Doporučeno pro Next.js)

**Výhody:**
- Zero-config deployment
- Automatické CI/CD
- Edge functions
- Optimalizace obrázků
- Preview deployments
- Free tier dostačující pro start

**Setup:**

1. **Připojení repozitáře:**
```bash
# Instalace Vercel CLI
npm i -g vercel

# Login
vercel login

# Link projektu
vercel link
```

2. **Environment Variables:**
```bash
# Přes Vercel Dashboard nebo CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production
# ... atd pro všechny proměnné
```

3. **Deploy:**
```bash
# Production deployment
vercel --prod

# nebo automaticky při push na main
git push origin main
```

**Vercel Configuration:**

`vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://theglobalists.com"
  }
}
```

---

### Option 2: Railway

**Výhody:**
- Postgresl + Redis v jednom
- Simple pricing
- Automatic SSL
- Logs & metrics

**Setup:**

1. **Vytvoření projektu:**
   - Přihlásit se na [Railway](https://railway.app)
   - "New Project" → "Deploy from GitHub repo"
   - Vybrat repozitář

2. **Přidat služby:**
   - Add PostgreSQL
   - Add Redis
   - Add Next.js app

3. **Environment variables:**
   - Railway automaticky nastaví DATABASE_URL a REDIS_URL
   - Manuálně přidat ostatní

4. **Deploy:**
   - Automaticky při push na main

---

### Option 3: DigitalOcean App Platform

**Výhody:**
- Predictable pricing
- Managed databases
- CDN included

**Setup podobný Railway**

---

## 🗄️ Database Hosting

### Option 1: Neon (Doporučeno)

**Výhody:**
- Serverless PostgreSQL
- Automatické škálování
- Branching pro dev/staging
- Free tier: 0.5 GB

**Setup:**

1. Vytvořit účet: https://neon.tech
2. Vytvořit projekt
3. Zkopírovat connection string
4. Nastavit jako `DATABASE_URL`

**Connection pooling:**
```env
# Direct connection (pro migrace)
DATABASE_URL="postgresql://user:pass@host/db"

# Pooled connection (pro app)
DATABASE_URL="postgresql://user:pass@host/db?pgbouncer=true"
```

---

### Option 2: Supabase

**Výhody:**
- PostgreSQL + realtime
- Built-in auth (alternativa k NextAuth)
- Storage
- Free tier: 500 MB

**Setup:**
1. Vytvořit projekt: https://supabase.com
2. Database → Connection string
3. Zkopírovat do `DATABASE_URL`

---

### Option 3: PlanetScale (MySQL)

**Poznámka:** Vyžaduje změnu z PostgreSQL na MySQL

---

## 🔴 Redis Hosting

### Option 1: Upstash

**Výhody:**
- Serverless Redis
- Pay per request
- Free tier: 10k requests/day

**Setup:**

1. Vytvořit účet: https://upstash.com
2. Create database
3. Zkopírovat `REDIS_URL`

```env
REDIS_URL="redis://default:***@us1-*******.upstash.io:6379"
```

---

### Option 2: Redis Cloud

**Setup:**
1. https://redis.com/try-free/
2. Create subscription
3. Copy connection string

---

## 🔐 Environment Variables

### Produkční .env

Vytvořte tyto proměnné v deployment platformě:

```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://theglobalists.com

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
NEXTAUTH_SECRET=<generovat nový pro produkci!>
NEXTAUTH_URL=https://theglobalists.com

# Stripe (LIVE MODE!)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@theglobalists.com

# Optional
SENTRY_DSN=...
ANALYTICS_ID=...
```

**⚠️ BEZPEČNOST:**
- NIKDY necommitujte .env soubory
- Použijte různé secrets pro production
- Rotujte klíče pravidelně
- Nastavte pouze potřebná oprávnění

---

## 🎯 Stripe Production Setup

### 1. Aktivace Live Mode

**Dashboard:**
1. Přejít do live mode (toggle)
2. Dokončit business profile
3. Ověřit bankovní účet

### 2. API Keys

**Získání:**
- Dashboard → Developers → API keys
- Zkopírovat `pk_live_...` a `sk_live_...`

### 3. Webhooks

**Vytvoření:**
1. Dashboard → Developers → Webhooks
2. Add endpoint: `https://theglobalists.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `account.updated` (Connect)
4. Zkopírovat webhook secret

### 4. Connect Settings

**Konfigurace:**
- Dashboard → Connect → Settings
- Branding (logo, colors)
- Redirect URLs
- Statement descriptor

---

## 📧 Email Production Setup

### Resend

**Ověření domény:**

1. **DNS záznamy:**
```
Type: TXT
Name: @
Value: resend-verify=abc123...

Type: MX
Name: @
Value: feedback-smtp.resend.com (priority 10)

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@theglobalists.com
```

2. **Ověření:**
   - Resend Dashboard → Domains
   - Add domain → Verify

3. **Update FROM_EMAIL:**
```env
FROM_EMAIL=noreply@theglobalists.com
```

---

## 🏗️ Build & Deploy Process

### Pre-deployment Checklist

```bash
# 1. Pull latest
git pull origin main

# 2. Install dependencies
npm ci

# 3. Run tests
npm run test
npm run test:e2e

# 4. Type check
npm run type-check

# 5. Lint
npm run lint

# 6. Build
npm run build

# 7. Test production build locally
npm run start
```

### Database Migrations

**Production migrations:**

```bash
# NIKDY nepoužívejte `migrate dev` v produkci!

# Preview migrace
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource postgresql://... \
  --script

# Aplikovat migrace
npx prisma migrate deploy

# Vygenerovat Prisma Client
npx prisma generate
```

**Rollback strategie:**

```bash
# Vytvořit rollback migraci
npx prisma migrate diff \
  --from-migrations ./prisma/migrations/[new] \
  --to-migrations ./prisma/migrations/[old] \
  --script > rollback.sql

# Aplikovat manuálně
psql $DATABASE_URL < rollback.sql
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 Monitoring & Logging

### Sentry (Error Tracking)

**Setup:**

1. Vytvořit účet: https://sentry.io
2. Create Next.js project
3. Install SDK:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

4. Konfigurace:

`sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

### Vercel Analytics

**Aktivace:**
```bash
npm install @vercel/analytics
```

`app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Logging

**Produkční logger:**

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined
})
```

---

## 🔒 Security Checklist

Pre-launch security review:

- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Secure headers (Helmet.js)
- [ ] Environment vars not exposed
- [ ] API routes authenticated
- [ ] Webhook signatures verified
- [ ] Input validation
- [ ] Password hashing (bcrypt)
- [ ] Session security
- [ ] File upload restrictions

**Next.js Security Headers:**

`next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

---

## 📈 Performance Optimization

### Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['res.cloudinary.com'], // pokud používáte CDN
    formats: ['image/avif', 'image/webp'],
  }
}
```

### Caching Strategy

**Redis cache:**
```typescript
// 1. Popular services - 5 min
// 2. Category stats - 10 min
// 3. Provider profiles - 15 min
// 4. Static content - 1 hour
```

**Next.js revalidation:**
```typescript
export const revalidate = 300 // 5 minutes
```

### Database Indexing

Ověřte indexy před launchem:

```sql
-- Analyzovat slow queries
EXPLAIN ANALYZE SELECT ...;

-- Přidat chybějící indexy
CREATE INDEX idx_service_category ON "Service"(category);
```

---

## 🎯 Launch Checklist

### 1 týden před:
- [ ] Testování v staging environment
- [ ] Load testing
- [ ] Security audit
- [ ] Backup strategie
- [ ] Monitoring setup
- [ ] Support email ready
- [ ] Legal pages (ToS, Privacy)

### 1 den před:
- [ ] Final build test
- [ ] Database backup
- [ ] DNS records ready
- [ ] SSL certificate active
- [ ] Team briefing

### Launch day:
- [ ] Deploy to production
- [ ] Smoke tests
- [ ] Monitor errors
- [ ] Check analytics
- [ ] Announce launch!

### Po launchi:
- [ ] Monitor 24/7 first 48h
- [ ] User feedback collection
- [ ] Performance metrics
- [ ] Hotfix readiness

---

## 🆘 Rollback Procedure

**Pokud se něco pokazí:**

### Vercel:
```bash
# Rollback na předchozí deployment
vercel rollback

# Nebo přes dashboard
# Deployments → Previous → Promote to Production
```

### Database:
```bash
# Aplikovat rollback SQL
psql $DATABASE_URL < rollback.sql

# Nebo Prisma migration
npx prisma migrate resolve --rolled-back [migration-name]
```

### Emergency contacts:
- Vercel support: support@vercel.com
- Stripe support: Live chat v dashboardu
- Neon support: Discord community

---

## 📚 Post-Deployment

### Monitoring

**Daily checks:**
- Error rate (Sentry)
- Response times
- Database performance
- Stripe transactions

**Weekly:**
- User growth
- Revenue metrics
- Top errors
- Feature usage

### Updates

**Strategie:**
- Feature flags pro gradual rollout
- Staging environment pro testing
- Automated backups před každým deployem
- Changelog documentation

### Scaling

**Když růst:**
- Database read replicas
- CDN pro static assets
- Redis clustering
- Horizontal scaling (containers)

---

## 💡 Best Practices

1. **Zero-downtime deployments** - používat blue-green nebo rolling
2. **Feature flags** - graduální rollout nových funkcí
3. **Database migrations** - vždy zpětně kompatibilní
4. **Monitoring first** - nastavit před nasazením
5. **Backup automation** - denní + před každým deployem
6. **Documentation** - aktualizovat s každou změnou

---

**Gratulujeme! 🎉** Váš marketplace je připraven pro svět!

**Další kroky:**
- Marketing & Launch
- User Acquisition
- Iterace na základě feedbacku
- Scale operations
