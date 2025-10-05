# 🛠️ Setup & Instalace

Tento průvodce vás provede kompletním nastavením vývojového prostředí pro The Globalists marketplace.

## 📋 Předpoklady

Před začátkem se ujistěte, že máte nainstalováno:

- **Node.js 20+** - [Stáhnout zde](https://nodejs.org/)
- **Docker & Docker Compose** - [Instalační průvodce](https://docs.docker.com/get-docker/)
- **Git** - [Stáhnout zde](https://git-scm.com/)
- **Code editor** - doporučujeme [VS Code](https://code.visualstudio.com/)

### Kontrola verzí

```bash
node --version  # v20.x.x nebo vyšší
npm --version   # v10.x.x nebo vyšší
docker --version # 24.x.x nebo vyšší
git --version   # 2.x.x nebo vyšší
```

## 🚀 Krok za krokem instalace

### 1. Klonování repozitáře

```bash
git clone https://github.com/your-org/the-globalists.git
cd the-globalists
```

### 2. Instalace závislostí

```bash
npm install
```

### 3. Environment proměnné

Vytvořte `.env.local` soubor v kořenovém adresáři:

```bash
cp .env.example .env.local
```

Vyplňte následující proměnné:

#### 🗄️ Databáze

```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/globalists?schema=public"
REDIS_URL="redis://localhost:6379"
```

#### 🔐 Autentizace

Vygenerujte bezpečný secret:

```bash
openssl rand -base64 32
```

```env
NEXTAUTH_SECRET="vygenerovaný-secret-zde"
NEXTAUTH_URL="http://localhost:3000"
```

#### 💳 Stripe (testovací režim)

1. Registrujte se na [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Získejte API klíče z [API keys](https://dashboard.stripe.com/test/apikeys)
3. Aktivujte Connect na [Connect settings](https://dashboard.stripe.com/settings/connect)
4. Vytvořte webhook endpoint: `http://localhost:3000/api/webhooks/stripe`

```env
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### 📧 Resend (email)

1. Registrujte se na [Resend](https://resend.com/signup)
2. Získejte API klíč z [API Keys](https://resend.com/api-keys)

```env
RESEND_API_KEY="re_..."
FROM_EMAIL="onboarding@resend.dev"
```

### 4. Spuštění databází

Spusťte PostgreSQL a Redis pomocí Docker:

```bash
docker-compose up -d
```

Ověření, že běží:

```bash
docker-compose ps
```

### 5. Migrace databáze

Vytvořte databázové schéma:

```bash
npx prisma migrate dev --name init
```

Vygenerujte Prisma Client:

```bash
npx prisma generate
```

### 6. (Volitelné) Seed data

Naplňte databázi testovacími daty:

```bash
npm run db:seed
```

### 7. Spuštění vývojového serveru

```bash
npm run dev
```

Aplikace běží na **http://localhost:3000** 🎉

## 🔧 Docker Compose konfigurace

Soubor `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: globalists-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-password
      POSTGRES_DB: globalists
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: globalists-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

## 🧪 Ověření instalace

### Kontrola databáze

```bash
npx prisma studio
```

Otevře Prisma Studio na `http://localhost:5555`

### Test API

```bash
curl http://localhost:3000/api/health
```

Očekávaná odpověď:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## 🛠️ Užitečné příkazy

### Prisma

```bash
# Otevřít Prisma Studio
npx prisma studio

# Vytvořit novou migraci
npx prisma migrate dev --name migration-name

# Reset databáze (VAROVÁNÍ: smaže všechna data!)
npx prisma migrate reset

# Aktualizovat Prisma Client
npx prisma generate

# Formátovat schema
npx prisma format
```

### Docker

```bash
# Spustit služby
docker-compose up -d

# Zastavit služby
docker-compose down

# Zobrazit logy
docker-compose logs -f

# Zobrazit status
docker-compose ps

# Vyčistit vše včetně volumes (VAROVÁNÍ: smaže data!)
docker-compose down -v
```

### Development

```bash
# Spustit dev server
npm run dev

# Build produkční verze
npm run build

# Spustit produkční server
npm run start

# Linting
npm run lint

# Formátování kódu
npm run format

# Testy
npm run test
```

## 🔍 Řešení problémů

### Port je již používán

Pokud port 3000, 5432 nebo 6379 je obsazený:

```bash
# Najít proces na portu
lsof -i :3000
# nebo
netstat -ano | findstr :3000  # Windows

# Ukončit proces
kill -9 <PID>
```

### Databáze se nepřipojuje

1. Zkontrolujte, že Docker kontejnery běží:
   ```bash
   docker-compose ps
   ```

2. Zkontrolujte logy:
   ```bash
   docker-compose logs postgres
   ```

3. Resetujte databázi:
   ```bash
   docker-compose down -v
   docker-compose up -d
   npx prisma migrate dev
   ```

### Prisma Client chyba

```bash
# Vymažte a regenerujte
rm -rf node_modules/.prisma
npx prisma generate
```

### Stripe webhook selhává

Pro lokální testování použijte Stripe CLI:

```bash
# Instalace
brew install stripe/stripe-cli/stripe  # macOS
# nebo stáhněte z https://stripe.com/docs/stripe-cli

# Přihlášení
stripe login

# Forwarding webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 📱 Doporučená VS Code rozšíření

Vytvořte `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-azuretools.vscode-docker",
    "usernamehw.errorlens"
  ]
}
```

## 🎯 Další kroky

✅ Setup dokončen! Nyní můžete:

1. Přečíst [Development Guide](./DEVELOPMENT.md) pro workflow
2. Prozkoumat [Databázové schéma](./DATABASE.md)
3. Prostudovat [Features](./FEATURES.md) co implementovat
4. Začít programovat! 🚀

## 💡 Tipy pro efektivní development

1. **Hot Reload** - Next.js automaticky reloaduje změny
2. **Prisma Studio** - vizuální editor databáze
3. **MCP Servery** - využijte dostupné MCP tools pro rychlejší vývoj
4. **Git hooks** - nastavte pre-commit hooks pro linting
5. **Environment variables** - nikdy necommitujte `.env.local`!

---

Potřebujete pomoc? Otevřete issue na GitHubu nebo se podívejte do [dokumentace](./README.md).
