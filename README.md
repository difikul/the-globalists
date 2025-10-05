# The Globalists 🌍

> B2B/B2C marketplace pro mezinárodní služby s provizním modelem

## 📋 O projektu

The Globalists je moderní marketplace spojující poskytovatele a zákazníky v oblasti mezinárodních služeb:

- 🛂 **Občanství** - Programy získání druhého občanství
- 🏠 **Rezidence** - Pobytová povolení a povolení k dlouhodobému pobytu
- 🏢 **Založení společnosti** - Registrace firem v různých jurisdikcích
- 🏦 **Banking** - Otevření bankovních účtů
- 🛡️ **Pojištění** - Mezinárodní pojistné produkty
- 📦 **Shipping** - Mezinárodní přepravní služby

## 💰 Business model

| Plán | Měsíční poplatek | Provize | Výhody |
|------|------------------|---------|--------|
| **Free** | 0 Kč | 10% | Základní listing |
| **Verified** | $100/měsíc | 5% | Ověřený badge, nižší provize |
| **Promotion** | $300 (jednorázově) | - | Pin na 30 dní v kategorii |

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework s App Router
- **TypeScript** - Typová bezpečnost
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Komponenty
- **TanStack Query** - Data fetching & caching
- **Zustand** - State management

### Backend
- **Next.js API Routes** - API endpoints
- **Prisma** - ORM pro databázi
- **PostgreSQL** - Hlavní databáze
- **Redis** - Caching layer

### Integrace
- **NextAuth.js v5** - Autentizace
- **Stripe Connect** - Platby a provize
- **Resend** - Email notifikace

### Infrastructure
- **Docker Compose** - Lokální development

## ⚡ Quick Start

```bash
# Klonování repozitáře
git clone https://github.com/your-org/the-globalists.git
cd the-globalists

# Instalace závislostí
npm install

# Kopírování environment proměnných
cp .env.example .env.local

# Spuštění databází
docker-compose up -d

# Migrace databáze
npx prisma migrate dev

# Spuštění dev serveru
npm run dev
```

Aplikace běží na `http://localhost:3000`

## 📚 Dokumentace

- [🛠️ Setup & Instalace](./docs/SETUP.md)
- [🗄️ Databázové schéma](./docs/DATABASE.md)
- [👨‍💻 Development Guide](./docs/DEVELOPMENT.md)
- [✨ Funkční specifikace](./docs/FEATURES.md)
- [🌐 API Dokumentace](./docs/API.md)
- [🚀 Deployment](./docs/DEPLOYMENT.md)

## 🎯 MVP Features

### Pro zákazníky
- ✅ Procházení služeb s filtry (země, kategorie, cena, hodnocení)
- ✅ Detailní informace o službách
- ✅ Bezpečný checkout přes Stripe
- ✅ Recenze a hodnocení
- ✅ Pokročilé vyhledávání

### Pro poskytovatele
- ✅ Registrace a onboarding
- ✅ Správa služeb (CRUD)
- ✅ Dashboard s analytiky
- ✅ Upgrade na Verified plán
- ✅ Propagace služeb
- ✅ Stripe Connect integrace

### Admin
- ✅ Správa uživatelů
- ✅ Moderace služeb
- ✅ Monitoring transakcí
- ✅ Systémové reporty

## 🏗️ Struktura projektu

```
/src
  /app
    /(auth)         # Login, registrace
    /(marketing)    # Veřejné stránky
    /(dashboard)    # Provider dashboard
    /api            # API routes + webhooks
  /components       # React komponenty
  /lib             # Utility funkce
  /server          # Server-side kód
/prisma            # Schema & migrace
/docker            # Docker konfigurace
/docs              # Dokumentace
```

## 🧪 Testování

```bash
# Unit testy
npm run test

# E2E testy
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🤝 Přispívání

1. Fork projektu
2. Vytvoř feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změny (`git commit -m 'Add some AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otevři Pull Request

## 📄 Licence

MIT License - viz [LICENSE](./LICENSE) soubor

## 🔗 Užitečné odkazy

- [Next.js Dokumentace](https://nextjs.org/docs)
- [Prisma Dokumentace](https://www.prisma.io/docs)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Shadcn/ui](https://ui.shadcn.com/)

## 💬 Podpora

Máte-li otázky nebo potřebujete pomoc:
- 📧 Email: support@theglobalists.com
- 💬 Discord: [Join our community](#)
- 📖 Dokumentace: [docs.theglobalists.com](#)

---

**Postaveno s ❤️ pro globální komunitu**
