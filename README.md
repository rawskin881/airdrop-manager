# 🚀 Airdrop Tracker — Anime-Themed Crypto Dashboard

A simple, anime-styled dashboard to manage and remind you about crypto airdrops. Built with Next.js 16, TypeScript, Tailwind CSS, and Prisma.

![Airdrop Tracker](public/maskot-header.png)

## ✨ Features

- ✅ **Full CRUD** — Add, edit, and delete airdrop entries
- ⏰ **Entry fields** — Name, Deadline, Status (Belum Klaim / Sudah Klaim / Pending), Notes, and a clickable URL link
- 🔔 **Deadline reminder** — Airdrops with deadline < 3 days are highlighted at the top of the dashboard
- 🔍 **Search & filter** — Find airdrops by name or notes, filter by status
- 📊 **Stats cards** — Total, Belum Klaim, Pending, Sudah Klaim counts
- 🎨 **Anime theme** — Pastel colors, sparkle/float animations, custom anime mascot illustrations
- 📦 **Download project** — Built-in button to download all source files as a ZIP

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Icons | Lucide React |
| Animations | CSS (sparkle, float, pulse) |

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/airdrops` | Get all airdrops |
| `POST` | `/api/airdrops` | Create a new airdrop |
| `GET` | `/api/airdrops/[id]` | Get a single airdrop |
| `PUT` | `/api/airdrops/[id]` | Update an airdrop |
| `DELETE` | `/api/airdrops/[id]` | Delete an airdrop |
| `POST` | `/api/seed` | Seed dummy data |
| `GET` | `/api/download` | Download project as ZIP |

### Example request body (POST /api/airdrops)

```json
{
  "name": "LayerZero ZRO Airdrop",
  "deadline": "2026-03-20",
  "status": "belum_klaim",
  "notes": "Check eligibility on official site",
  "url": "https://layerzero.foundation"
}
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- A database (SQLite for dev, PostgreSQL for prod)

### Installation

```bash
# Clone the repository
git clone https://github.com/rawskin881/airdrop-manager.git
cd airdrop-manager

# Install dependencies
bun install
# or
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Set up the database
bun run db:push
bun run db:generate

# Start the development server
bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`.

## 🗄 Database Schema

```prisma
model Airdrop {
  id        String   @id @default(cuid())
  name      String
  deadline  DateTime
  status    String   @default("belum_klaim") // belum_klaim | sudah_klaim | pending
  notes     String   @default("")
  url       String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx                      # Dashboard UI (anime theme)
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Anime pastel theme styles
│   └── api/
│       ├── airdrops/
│       │   ├── route.ts              # GET (list), POST (create)
│       │   └── [id]/route.ts         # GET, PUT, DELETE
│       ├── seed/route.ts             # Seed dummy data
│       └── download/route.ts         # Download project as ZIP
├── lib/
│   └── db.ts                         # Prisma client
prisma/
└── schema.prisma                     # Airdrop model
public/
├── maskot-header.png                 # Header mascot
├── maskot-urgent.png                 # Urgent reminder mascot
└── maskot-card.png                   # Empty state mascot
```

## ☁️ Deployment on Railway

This project is compatible with [Railway](https://railway.app/).

### Steps

1. Fork/clone this repo to your GitHub
2. Go to [Railway](https://railway.app/) → New Project → Deploy from GitHub repo
3. Add a PostgreSQL database plugin (Railway provides this built-in)
4. Set the environment variable:
   - `DATABASE_URL` = (Railway will provide this from the Postgres plugin)
5. Railway will auto-detect the Node.js app and deploy it
6. Run `bun run db:push` once after deploy (via Railway's shell) to create tables

### Railway config

A `Procfile` is included:

```
web: bun run start
```

> Note: For production, build with `bun run build` then start with `bun run start`.

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma client |

## 📝 License

MIT — free to use, modify, and distribute.

---

Made with ✨ anime vibes
