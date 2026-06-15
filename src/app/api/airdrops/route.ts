import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/airdrops - Get all airdrops
export async function GET() {
  try {
    const airdrops = await db.airdrop.findMany({
      orderBy: { deadline: 'asc' },
    })
    return NextResponse.json(airdrops)
  } catch (error) {
    console.error('Error fetching airdrops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch airdrops' },
      { status: 500 }
    )
  }
}

// POST /api/airdrops - Create new airdrop
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, deadline, status, notes, url } = body

    if (!name || !deadline) {
      return NextResponse.json(
        { error: 'Name and deadline are required' },
        { status: 400 }
      )
    }

    const airdrop = await db.airdrop.create({
      data: {
        name,
        deadline: new Date(deadline),
        status: status || 'belum_klaim',
        notes: notes || '',
        url: url || '',
      },
    })

    return NextResponse.json(airdrop, { status: 201 })
  } catch (error) {
    console.error('Error creating airdrop:', error)
    return NextResponse.json(
      { error: 'Failed to create airdrop' },
      { status: 500 }
    )
  }
}
