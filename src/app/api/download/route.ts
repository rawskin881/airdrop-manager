import { NextResponse } from 'next/server'
import { ZipArchive } from 'archiver'
import { Writable } from 'stream'
import fs from 'fs/promises'
import path from 'path'

// Key project files to include in the download
const PROJECT_FILES = [
  // Core app files
  { path: 'src/app/page.tsx', desc: 'Dashboard UI (anime-themed)' },
  { path: 'src/app/layout.tsx', desc: 'Root layout' },
  { path: 'src/app/globals.css', desc: 'Global styles (anime pastel theme)' },

  // API routes
  { path: 'src/app/api/airdrops/route.ts', desc: 'CRUD API - List & Create' },
  { path: 'src/app/api/airdrops/[id]/route.ts', desc: 'CRUD API - Get, Update, Delete' },
  { path: 'src/app/api/seed/route.ts', desc: 'Seed dummy data' },

  // Database
  { path: 'prisma/schema.prisma', desc: 'Database schema' },
  { path: 'src/lib/db.ts', desc: 'Prisma client connection' },

  // Config files
  { path: 'package.json', desc: 'Project dependencies' },
  { path: 'tsconfig.json', desc: 'TypeScript config' },
  { path: 'tailwind.config.ts', desc: 'Tailwind CSS config' },
  { path: 'postcss.config.mjs', desc: 'PostCSS config' },
  { path: 'next.config.ts', desc: 'Next.js config' },
  { path: 'components.json', desc: 'shadcn/ui config' },
]

export async function GET() {
  try {
    const chunks: Buffer[] = []

    const writable = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(Buffer.from(chunk))
        callback()
      },
    })

    const archive = new ZipArchive({
      zlib: { level: 9 },
    })

    archive.pipe(writable)

    // Add a README file with project info
    const readme = `# 🚀 Airdrop Tracker — Anime-Themed Crypto Dashboard

## Deskripsi
Dashboard sederhana untuk mengelola dan mengingatkan airdrop crypto dengan tema anime (warna pastel, ilustrasi karakter anime).

## Fitur Utama
- ✅ Tambah, Edit, Hapus entry airdrop (CRUD)
- ⏰ Setiap entry: Nama Airdrop, Deadline, Status, Notes, URL Link
- 🔔 Reminder: tampilkan airdrop dengan deadline < 3 hari
- 🔍 Search & filter berdasarkan nama/status
- 🎨 Tema anime dengan warna pastel

## Status Airdrop
- \`belum_klaim\` — Belum diklaim
- \`sudah_klaim\` — Sudah diklaim
- \`pending\` — Menunggu

## API Endpoints (RESTful)
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| GET    | /api/airdrops      | Ambil semua airdrop  |
| POST   | /api/airdrops      | Tambah airdrop baru  |
| GET    | /api/airdrops/[id] | Ambil satu airdrop   |
| PUT    | /api/airdrops/[id] | Update airdrop       |
| DELETE | /api/airdrops/[id] | Hapus airdrop        |
| POST   | /api/seed          | Seed dummy data      |

## Tech Stack
- **Framework**: Next.js 16 + App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM + SQLite
- **Icons**: Lucide React
- **Animations**: CSS (sparkle, float, pulse)
- **Images**: AI-generated anime illustrations

## Cara Menjalankan
\`\`\`bash
# Install dependencies
bun install

# Setup database
bun run db:push
bun run db:generate

# Jalankan development server
bun run dev
\`\`\`

## Struktur File Penting
\`\`\`
src/
├── app/
│   ├── page.tsx              ← Dashboard UI (anime theme)
│   ├── layout.tsx            ← Root layout
│   ├── globals.css           ← Anime pastel theme styles
│   └── api/
│       ├── airdrops/
│       │   ├── route.ts      ← GET (list), POST (create)
│       │   └── [id]/route.ts ← GET, PUT, DELETE
│       └── seed/route.ts     ← Seed dummy data
├── lib/
│   └── db.ts                 ← Prisma client
prisma/
└── schema.prisma             ← Airdrop model
public/
├── anime-hero.png            ← Anime illustration
├── anime-mascot.png          ← Anime mascot
└── anime-reminder.png        ← Anime reminder illustration
\`\`\`

## Database Schema (Prisma)
\`\`\`prisma
model Airdrop {
  id        String   @id @default(cuid())
  name      String
  deadline  DateTime
  status    String   @default("belum_klaim")
  notes     String   @default("")
  url       String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
\`\`\`

---
Made with ✨ anime vibes
`

    archive.append(readme, { name: 'README.md' })

    // Add project source files
    for (const file of PROJECT_FILES) {
      try {
        const filePath = path.join(process.cwd(), file.path)
        const content = await fs.readFile(filePath, 'utf-8')

        // Add a description comment at the top of code files
        const isConfig = file.path.endsWith('.json') || file.path.endsWith('.mjs')
        const header = isConfig
          ? ''
          : `// ${'='.repeat(60)}\n// 📁 ${file.path} — ${file.desc}\n// ${'='.repeat(60)}\n\n`

        archive.append(header + content, { name: `src-files/${file.path}` })
      } catch {
        // Skip files that can't be read (e.g., dynamic route brackets in glob)
      }
    }

    // Add the dynamic route file separately (brackets in filename)
    try {
      const dynamicRoutePath = path.join(process.cwd(), 'src/app/api/airdrops/[id]/route.ts')
      const dynamicRouteContent = await fs.readFile(dynamicRoutePath, 'utf-8')
      archive.append(
        `// ${'='.repeat(60)}\n// 📁 src/app/api/airdrops/[id]/route.ts — CRUD API - Get, Update, Delete\n// ${'='.repeat(60)}\n\n` + dynamicRouteContent,
        { name: 'src-files/src/app/api/airdrops/[id]/route.ts' }
      )
    } catch {
      // Skip if can't read
    }

    // Add the download route itself
    try {
      const downloadRoutePath = path.join(process.cwd(), 'src/app/api/download/route.ts')
      const downloadRouteContent = await fs.readFile(downloadRoutePath, 'utf-8')
      archive.append(
        `// ${'='.repeat(60)}\n// 📁 src/app/api/download/route.ts — Download project as zip\n// ${'='.repeat(60)}\n\n` + downloadRouteContent,
        { name: 'src-files/src/app/api/download/route.ts' }
      )
    } catch {
      // Skip if can't read
    }

    await archive.finalize()

    const buffer = Buffer.concat(chunks)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="airdrop-tracker-project.zip"',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error creating zip:', error)
    return NextResponse.json(
      { error: 'Failed to create download' },
      { status: 500 }
    )
  }
}
