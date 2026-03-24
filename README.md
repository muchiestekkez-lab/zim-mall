# ZIM MALL

Zimbabwe's Premier Online Marketplace — a production-ready B2C marketplace where sellers create stores and customers contact them directly.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Auth**: NextAuth v5 (credentials + Google OAuth)
- **Database**: PostgreSQL via Prisma ORM
- **Images**: Cloudinary
- **Payments**: Paynow Zimbabwe

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon, Supabase, Railway, or local)
- Cloudinary account
- Paynow Zimbabwe merchant account
- Google OAuth credentials (optional)

## Setup

### 1. Clone and install

```bash
cd zim-mall
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret (run: `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your app URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `PAYNOW_INTEGRATION_ID` | Paynow integration ID |
| `PAYNOW_INTEGRATION_KEY` | Paynow integration key |

### 3. Database setup

```bash
npm run db:push
```

Or with migrations:

```bash
npm run db:migrate
```

### 4. Create admin user

After first run, manually update a user's role in the database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import in Vercel
3. Add all environment variables
4. Deploy

### Database

Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for hosted PostgreSQL.

## Subscription Plans

| Plan | Price | Products | Features |
|---|---|---|---|
| Starter | $5/mo | 20 | Basic store, WhatsApp contact |
| Business | $20/mo | 100 | Featured listings, analytics |
| Premium | $50/mo | Unlimited | Verified badge, top placement |

## Project Structure

```
zim-mall/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── products/[id]/     # Product detail
│   ├── sellers/[id]/      # Seller store page
│   ├── search/            # Search with filters
│   ├── dashboard/         # Seller dashboard
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/
│   ├── layout/            # Navbar, Footer, Sidebar
│   ├── ui/                # Button, Input, Card, Modal, etc.
│   ├── products/          # ProductCard, ProductGrid, ProductForm
│   ├── seller/            # SellerCard, SubscriptionGate
│   └── subscription/      # PricingCard, PaynowCheckout
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # Prisma client
│   ├── cloudinary.ts      # Image uploads
│   ├── paynow.ts          # Payment integration
│   ├── moderation.ts      # Content moderation
│   ├── utils.ts           # Helpers
│   └── validations.ts     # Zod schemas
└── prisma/
    └── schema.prisma       # Database schema
```

## Content Moderation

The platform auto-blocks listings containing:
- Weapons and firearms
- Illegal drugs
- Adult content
- Stolen/counterfeit goods

## Safety Features

- Verified seller badges
- Report system for flagging suspicious listings
- Safety tip shown on every product page
- Rate-limited reporting (5/day per user)
