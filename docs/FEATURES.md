# ✨ Funkční specifikace

Detailní popis všech funkcionalit The Globalists marketplace.

## 🏠 Homepage

### Hero sekce

**Komponenty:**
- Hlavní nadpis + podnadpis
- Search bar s dual filtry:
  - Category dropdown (6 možností)
  - Country autocomplete
- CTA button "Search Services"
- Background: gradient nebo hero image

**Mockup:**
```
┌─────────────────────────────────────────────┐
│  🌍 The Globalists                          │
│                                             │
│  Your Gateway to Global Opportunities       │
│                                             │
│  ┌─────────────┐ ┌──────────────┐ [Search] │
│  │ Category ▼  │ │ Country      │          │
│  └─────────────┘ └──────────────┘          │
└─────────────────────────────────────────────┘
```

### Category Cards (6x)

**Každá karta obsahuje:**
- Ikona kategorie
- Název (např. "Citizenship")
- Krátký popis (1 řádek)
- Počet dostupných služeb
- Link na category page

**Layout:** Grid 3 sloupce desktop, 2 tablet, 1 mobile

**Příklad:**
```
┌──────────────────────┐
│  🛂                   │
│  Citizenship          │
│  Second passport      │
│  programs             │
│                       │
│  127 services →       │
└──────────────────────┘
```

### Featured Services

**Zobrazení:**
- Top 8 služeb podle:
  - Promoted (priorita)
  - Rating
  - Recent sales
- Carousel nebo grid layout
- Každá karta: obrázek, název, cena, rating, verified badge

**CTA:**
- "View all services" button

---

## 📂 Category Pages

**URL:** `/services/citizenship`, `/services/residency`, atd.

### Layout

```
┌─────────────────────────────────────────────────┐
│ Header                                          │
├──────────┬──────────────────────────────────────┤
│ Filters  │ Services Grid                        │
│          │                                      │
│ Country  │ [Promoted - highlighted]             │
│ Price    │ [Service Card] [Service Card]        │
│ Rating   │ [Service Card] [Service Card]        │
│ Verified │ [Service Card] [Service Card]        │
│          │                                      │
│          │ Pagination                           │
└──────────┴──────────────────────────────────────┘
```

### Filtry (Sidebar)

**Country filter:**
- Searchable dropdown
- Multi-select
- Zobrazit count pro každou zemi

**Price range:**
- Slider nebo input fields
- Min/Max v USD
- Reset button

**Rating:**
- Checkboxes: 5★, 4★+, 3★+
- Clear all

**Verified only:**
- Toggle switch
- Zobrazit pouze verified providers

**Sort by:**
- Relevance (default)
- Price: Low to High
- Price: High to Low
- Rating: High to Low
- Newest First

### Service Card

```
┌─────────────────────────────┐
│ [Image/Placeholder]         │
│                             │
│ Malta Citizenship...   ✓    │
│ by Global Services Inc      │
│                             │
│ ⭐ 4.8 (24 reviews)         │
│ 📍 Malta                    │
│                             │
│ $750,000                    │
│                             │
│ [View Details]              │
└─────────────────────────────┘
```

**Highlighted pro promoted:**
- Border: gold/premium color
- Badge: "Featured" nebo "⭐ Promoted"
- Sticky na top gridu

### Pagination

- 12 služeb per page
- "Previous" / "Next" buttons
- Page numbers (max 5 visible)
- "Jump to page" input

---

## 🔍 Service Detail Page

**URL:** `/services/[slug]`

### Struktura

**Hero sekce:**
```
┌─────────────────────────────────────────────┐
│ ← Back to Category                          │
│                                             │
│ [Main Image]     │ Malta Citizenship        │
│                  │ by Investment       ✓    │
│ [Gallery]        │                          │
│                  │ by Global Services Inc   │
│                  │ ⭐ 4.8 (24 reviews)      │
│                  │                          │
│                  │ $750,000                 │
│                  │                          │
│                  │ [Purchase Service]       │
└─────────────────────────────────────────────┘
```

**Tabs:**
1. **Overview**
   - Description (rich text)
   - Key features (bullet points)
   - Processing time
   - Country information

2. **Requirements**
   - Documents needed
   - Eligibility criteria
   - Prerequisites

3. **Reviews** (24)
   - Average rating breakdown
   - Filter by rating
   - Sort by: Recent, Helpful, Rating
   - Review cards with:
     - User name + avatar
     - Star rating
     - Date
     - Comment
     - Helpful count

4. **About Provider**
   - Company name
   - Description
   - Verified badge
   - Total services
   - Member since
   - [View all services] button

**Related Services:**
- 4 similar services
- Same category nebo country
- Carousel layout

---

## 🛒 Checkout Flow

**URL:** `/checkout/[serviceId]`

### Krok 1: Review

```
┌─────────────────────────────────────────────┐
│ Checkout                                    │
├─────────────────────────────────────────────┤
│ Service Summary                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [Image] Malta Citizenship               │ │
│ │         $750,000                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Contact Information                         │
│ ┌─────────────────────────────────────────┐ │
│ │ Email: user@example.com                 │ │
│ │ Name: John Doe                          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Price Breakdown                             │
│ Service price:           $750,000           │
│ Platform fee (10%):       $75,000           │
│ ─────────────────────────────────────────   │
│ Total:                   $825,000           │
│                                             │
│ [Proceed to Payment]                        │
└─────────────────────────────────────────────┘
```

### Krok 2: Payment

**Stripe Elements:**
- Card number
- Expiry date
- CVC
- Billing address

**Security:**
- SSL badge
- Stripe secured badge
- "Your information is encrypted"

**CTA:**
- "Complete Purchase" button
- Loading state během processing

### Krok 3: Confirmation

```
┌─────────────────────────────────────────────┐
│ ✅ Purchase Successful!                     │
│                                             │
│ Thank you for your purchase.                │
│ You will receive a confirmation email.      │
│                                             │
│ Transaction ID: #TXN-12345                  │
│                                             │
│ Next Steps:                                 │
│ 1. Provider will contact you within 24h    │
│ 2. Prepare required documents              │
│ 3. Follow provider's instructions          │
│                                             │
│ [View Transaction] [Back to Home]           │
└─────────────────────────────────────────────┘
```

---

## 👤 User Dashboard

**URL:** `/dashboard`

### Pro Customers

**Sekce:**

1. **My Purchases**
   - Seznam koupených služeb
   - Status: Pending, In Progress, Completed
   - Contact provider button
   - Download invoice

2. **Saved Services**
   - Wishlist funkcionalita
   - Quick checkout

3. **Profile Settings**
   - Personal info
   - Email preferences
   - Password change

---

## 🏢 Provider Dashboard

**URL:** `/dashboard/provider`

### Overview

**Stats cards:**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Total Sales │ │ Revenue     │ │ Services    │
│ $1.2M       │ │ $1.08M      │ │ 8 active    │
└─────────────┘ └─────────────┘ └─────────────┘
```

**Charts:**
- Sales over time (30 days)
- Top performing services
- Traffic sources

**Recent transactions:**
- Table s posledními 10 transakcemi
- Quick view details

### My Services

**List view:**
```
┌───────────────────────────────────────────────────────┐
│ Service                Status    Views  Sales  Actions │
├───────────────────────────────────────────────────────┤
│ Malta Citizenship     Published  1,247   12   [⚙][📊] │
│ Portugal Residency    Draft         0     0   [✏][🗑]  │
└───────────────────────────────────────────────────────┘
```

**Actions:**
- ⚙ Edit
- 📊 Analytics
- ✏ Quick edit
- 🗑 Delete
- [+ Create New Service]

### Create/Edit Service

**Form sekce:**

1. **Basic Info**
   - Title
   - Category (dropdown)
   - Country (searchable)
   - Price
   - Processing time

2. **Description**
   - Rich text editor
   - Image upload
   - Gallery (multiple images)

3. **Features**
   - Dynamic list
   - Add/remove bullets

4. **Requirements**
   - Document checklist
   - Eligibility criteria

5. **SEO**
   - Meta title
   - Meta description
   - URL slug (auto-generated, editable)

**Status:**
- Save as Draft
- Publish
- Unpublish

### Subscription

**Current plan card:**
```
┌─────────────────────────────────────────────┐
│ Current Plan: FREE                          │
│                                             │
│ Commission rate: 10%                        │
│ Verified badge: ❌                          │
│                                             │
│ [Upgrade to Verified - $100/month]         │
└─────────────────────────────────────────────┘
```

**Upgrade flow:**
1. Click "Upgrade to Verified"
2. Review benefits:
   - ✓ 5% commission (save 50%!)
   - ✓ Verified badge
   - ✓ Priority support
   - ✓ Advanced analytics
3. Enter payment details (Stripe)
4. Confirm subscription
5. Success message

### Promotions

**Purchase promotion:**
```
┌─────────────────────────────────────────────┐
│ Promote Your Service                        │
│                                             │
│ Select service: [Dropdown]                  │
│ Category: Citizenship                       │
│                                             │
│ Benefits:                                   │
│ • Pinned to top of category for 30 days    │
│ • Gold highlight border                    │
│ • "Featured" badge                          │
│ • 3x visibility on average                  │
│                                             │
│ Price: $300 (one-time)                      │
│                                             │
│ [Purchase Promotion]                        │
└─────────────────────────────────────────────┘
```

**Active promotions:**
- Seznam aktivních promocí
- Expiry countdown
- Analytics (views, clicks)

### Stripe Connect

**Onboarding status:**

```
┌─────────────────────────────────────────────┐
│ Payment Setup                               │
│                                             │
│ Status: ⚠️ Not connected                    │
│                                             │
│ To receive payments, connect your Stripe    │
│ account.                                    │
│                                             │
│ [Connect Stripe Account]                    │
└─────────────────────────────────────────────┘
```

**Po připojení:**
```
┌─────────────────────────────────────────────┐
│ Payment Setup                               │
│                                             │
│ Status: ✅ Connected                        │
│ Account: ac_***************1234             │
│                                             │
│ Available balance: $12,450                  │
│ Pending: $3,200                             │
│                                             │
│ [View Stripe Dashboard]                     │
└─────────────────────────────────────────────┘
```

---

## 👨‍💼 Admin Dashboard

**URL:** `/admin`

**Přístup:** Pouze `role: ADMIN`

### Overview

**Metrics:**
- Total users (breakdown by role)
- Total services
- Total transactions (GMV)
- Platform revenue

### Users Management

**Table:**
- Seznam všech uživatelů
- Filtry: Role, Status, Date joined
- Actions: View, Edit role, Ban, Delete

### Services Moderation

**Queue:**
- Služby čekající na schválení
- Quick approve/reject
- Request changes

**All services:**
- Search, filter
- Bulk actions
- Feature/unfeature

### Transactions

**List view:**
- All transactions
- Filtry: Status, Date range, Amount
- Export to CSV
- Refund capability

### Reports

**Generování reportů:**
- Sales report (date range)
- Provider performance
- Category analytics
- Revenue breakdown

---

## 📧 Email Notifications

### Welcome Email

**Trigger:** Po registraci

**Obsah:**
```
Subject: Welcome to The Globalists! 🌍

Hi [Name],

Welcome to The Globalists marketplace!

You can now:
• Browse international services
• Save your favorites
• Get verified providers

[Explore Services]

Questions? Reply to this email.
```

### Purchase Confirmation (Buyer)

**Trigger:** Po úspěšném nákupu

**Obsah:**
- Transaction ID
- Service details
- Amount paid
- Provider contact
- Next steps
- Invoice (PDF attachment)

### Sale Notification (Seller)

**Trigger:** Když někdo koupí službu

**Obsah:**
- Buyer information
- Service purchased
- Your earnings
- Payment timeline
- [View Transaction]

### Subscription Renewal

**Trigger:** 3 dny před renewal

**Obsah:**
- Current plan
- Renewal date
- Amount to be charged
- [Manage Subscription]

### Promotion Expiring

**Trigger:** 7 dní před expirací

**Obsah:**
- Service name
- Expiry date
- Performance stats
- [Renew Promotion]

---

## 🔔 In-App Notifications

**Bell icon v headeru:**
- Unread count badge
- Dropdown s posledními 5
- "See all" link

**Typy notifikací:**
- New purchase
- New review
- Subscription renewed
- Promotion expired
- Service approved/rejected
- System announcements

**Persistence:**
- Ukládat v DB
- Mark as read
- Auto-delete po 30 dnech

---

## 🔒 Security Features

### Authentication

- Email/password login
- Email verification required
- Password reset flow
- Session management (7 days)
- CSRF protection

### Authorization

- Role-based access (CUSTOMER/PROVIDER/ADMIN)
- Resource ownership checks
- API route protection

### Data Protection

- HTTPS only
- Encrypted passwords (bcrypt)
- Secure cookie flags
- Rate limiting na API
- Input sanitization

### Stripe Security

- PCI compliant (Stripe handles cards)
- Webhook signature verification
- Idempotency keys
- Metadata validation

---

## 📱 Responsive Design

### Breakpoints

```css
mobile: 0-767px
tablet: 768px-1023px
desktop: 1024px+
```

### Mobile-specific

**Navigation:**
- Hamburger menu
- Bottom nav bar (optional)
- Swipeable modals

**Forms:**
- Stack všech inputů
- Sticky CTA buttons
- Native pickers (date, select)

**Cards:**
- Full-width na mobile
- Horizontal scroll pro galleries

---

## ♿ Accessibility

**WCAG 2.1 Level AA:**

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast ratio 4.5:1
- Alt text pro obrázky
- Screen reader friendly

**Testing:**
```bash
npm run test:a11y
```

---

## 🎨 Design System

**Barvy:**
```
Primary: #2563eb (blue)
Secondary: #f59e0b (amber)
Success: #10b981 (green)
Error: #ef4444 (red)
Warning: #f59e0b (amber)
```

**Typography:**
```
Headings: Inter (font-family)
Body: Inter
Monospace: Fira Code
```

**Spacing:**
- Scale: 4px base (4, 8, 12, 16, 24, 32, 48, 64)

**Komponenty:**
- Používat Shadcn/ui
- Customizovat přes tailwind.config

---

## ✅ MVP Success Criteria

Feature musí fungovat aby bylo považováno za kompletní:

- [ ] User registrace/login ✓
- [ ] Provider profile creation ✓
- [ ] Service posting ✓
- [ ] Search & filtry ✓
- [ ] Promoted services pinned ✓
- [ ] Payment checkout ✓
- [ ] Commission splits correctly ✓
- [ ] Subscription billing ✓
- [ ] Verified badge display ✓
- [ ] Mobile responsive ✓
- [ ] Email notifications ✓
- [ ] Error handling ✓

---

**Další kroky:**
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Development Guide](./DEVELOPMENT.md)
