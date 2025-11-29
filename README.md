# TinyLink — URL Shortener

A production-ready URL shortening service built with **Next.js 16**, **Prisma**, and **PostgreSQL**.

## Features

- 🔗 Shorten URLs with custom or auto-generated codes
- 📊 Click tracking with atomic transactions
- 🗑️ Soft delete (no data loss)
- ⚡ Fast redirects with collision handling
- 🌐 Serverless-ready architecture

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/tinylink.git
cd tinylink
npm install
```

### 2. Setup Database

Create a `.env` file:

```env
DATABASE_URL="your-postgresql-connection-string"
```

Run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/links` | Create short link |
| `GET` | `/api/links` | List all links |
| `GET` | `/api/links/:code` | Get link details |
| `DELETE` | `/api/links/:code` | Soft delete link |
| `GET` | `/:code` | Redirect to target URL |

## Usage Examples

### Create a Short Link

```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target": "https://example.com"}'
```

### Create with Custom Code

```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target": "https://example.com", "code": "custom"}'
```

### Use the Short Link

Visit: `http://localhost:3000/abc123`

## Database Schema

```prisma
model Link {
  id          String    @id @default(uuid())
  code        String    @unique
  target      String
  clicks      Int       @default(0)
  createdAt   DateTime  @default(now())
  lastClicked DateTime?
  deleted     Boolean   @default(false)
}
```

## Deployment

### Vercel + Neon

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable: `DATABASE_URL`
4. Deploy migrations:

```bash
npx prisma migrate deploy
```

## Validation Rules

- ✅ URLs must start with `http://` or `https://`
- ✅ Codes must be alphanumeric, 6-8 characters
- ✅ Auto-generated codes have collision retry (5 attempts)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── links/
│   │       ├── route.ts          # Create & list links
│   │       └── [code]/
│   │           └── route.ts      # Get & delete link
│   └── [code]/
│       └── route.ts              # Redirect handler
├── lib/
│   ├── prisma.ts                 # Prisma client
│   ├── codegen.ts                # Code generator
│   └── validators.ts             # Input validation
prisma/
└── schema.prisma                 # Database schema
```

---

Built with ❤️ using Next.js 16 and Prisma
