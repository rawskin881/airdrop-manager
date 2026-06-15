import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/seed - Seed dummy airdrop data
export async function POST() {
  try {
    // Check if data already exists
    const existing = await db.airdrop.count()

    if (existing > 0) {
      return NextResponse.json(
        { message: 'Database already has data. Skipping seed.' },
        { status: 200 }
      )
    }

    const now = new Date()
    const inOneDay = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const inFourteenDays = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    const airdrops = await db.airdrop.createMany({
      data: [
        {
          name: 'LayerZero ZRO Token Airdrop',
          deadline: inOneDay,
          status: 'belum_klaim',
          notes: 'Cek eligibility di situs resmi. Staking LZ sebelum snapshot.',
          url: 'https://layerzero.foundation',
        },
        {
          name: 'zkSync ERA Airdrop',
          deadline: inTwoDays,
          status: 'pending',
          notes: 'Sudah bridge beberapa kali. Tunggu announcement resmi.',
          url: 'https://zksync.io',
        },
        {
          name: 'Starknet STRK Token',
          deadline: inSevenDays,
          status: 'sudah_klaim',
          notes: 'Sudah klaim fase 1. Ada kemungkinan fase 2.',
          url: 'https://starknet.io',
        },
        {
          name: 'Scroll SCR Airdrop',
          deadline: inFourteenDays,
          status: 'belum_klaim',
          notes: 'Bridge ETH ke Scroll network dan lakukan beberapa transaksi.',
          url: 'https://scroll.io',
        },
        {
          name: 'Celestia TIA Genesis',
          deadline: threeDaysAgo,
          status: 'sudah_klaim',
          notes: 'Airdrop sudah selesai. Token sudah di-claim.',
          url: 'https://celestia.org',
        },
      ],
    })

    return NextResponse.json(
      { message: `Seeded ${airdrops.count} airdrops successfully` },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    )
  }
}
