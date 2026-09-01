# Smart City

**Product & Seller Discovery Platform** — Pilot launch in Kariakoo, Dar es Salaam, Tanzania.

> Find what you need. Know where to find it.

Smart City helps customers discover products, find sellers, see locations, and contact sellers directly. It is **not** an e-commerce marketplace — purchases happen offline between customers and sellers.

## Core Journey

**Discover → Search → Find Product → Find Seller → See Location → Contact Seller**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, Lucide Icons |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT |

## Project Structure

```
smart-city/
├── client/          # Mobile-first React web app + Admin dashboard
├── server/          # Express API server
│   ├── prisma/      # Database schema & seed
│   └── src/         # API routes & middleware
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE smartcity;
```

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API runs at `http://localhost:3001`

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartcity.co.tz | admin123 |
| Seller | seller@kariakoo.co.tz | seller123 |
| Seller (Tech) | tech@kariakoo.co.tz | seller123 |
| Customer | customer@example.com | customer123 |

## Features (MVP)

### Customer
- Guest browsing & product discovery feed
- Personalized feed based on preferences
- Product search with filters (category, area, price)
- Product details with like, save, call, message
- Seller profiles with location & directions
- Direct messaging with sellers
- Customer/Seller dual-role on one account

### Seller
- Shop profile creation with location
- Product management (add, edit, delete, publish instantly)
- Image uploads
- Message customers
- Seller dashboard

### Admin
- Platform analytics (users, products, views, searches)
- User management (enable/disable)
- Product & shop moderation
- Category management

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register account |
| POST | `/api/auth/login` | Login |
| GET | `/api/products/feed` | Product discovery feed |
| GET | `/api/products/search` | Search products & sellers |
| GET | `/api/products/:id` | Product details |
| POST | `/api/products/:id/like` | Like/unlike product |
| POST | `/api/products/:id/save` | Save/unsave product |
| GET | `/api/shops/:id` | Shop/seller profile |
| POST | `/api/seller/products` | Create product |
| GET | `/api/messages` | List conversations |
| POST | `/api/messages/:id/messages` | Send message |
| GET | `/api/admin/stats` | Platform analytics |

## Design Philosophy

- **TikTok-style** product discovery feed
- **Instagram-style** seller profiles
- **WhatsApp-style** messaging
- **Map-based** seller location discovery
- Mobile-first, fast, clean, original Smart City branding

## MVP Boundaries

**Included:** Discovery, search, profiles, location, messaging, likes, saves, admin analytics

**Not included:** Payments, checkout, delivery, subscriptions, ads, mandatory product approval

## License

Private — Smart City Platform
