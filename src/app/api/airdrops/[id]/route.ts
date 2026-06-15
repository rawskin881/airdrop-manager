import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/airdrops/[id] - Get single airdrop
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const airdrop = await db.airdrop.findUnique({
      where: { id },
    })

    if (!airdrop) {
      return NextResponse.json(
        { error: 'Airdrop not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(airdrop)
  } catch (error) {
    console.error('Error fetching airdrop:', error)
    return NextResponse.json(
      { error: 'Failed to fetch airdrop' },
      { status: 500 }
    )
  }
}

// PUT /api/airdrops/[id] - Update airdrop
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, deadline, status, notes, url } = body

    const existing = await db.airdrop.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Airdrop not found' },
        { status: 404 }
      )
    }

    const airdrop = await db.airdrop.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(deadline !== undefined && { deadline: new Date(deadline) }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(url !== undefined && { url }),
      },
    })

    return NextResponse.json(airdrop)
  } catch (error) {
    console.error('Error updating airdrop:', error)
    return NextResponse.json(
      { error: 'Failed to update airdrop' },
      { status: 500 }
    )
  }
}

// DELETE /api/airdrops/[id] - Delete airdrop
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.airdrop.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Airdrop not found' },
        { status: 404 }
      )
    }

    await db.airdrop.delete({ where: { id } })

    return NextResponse.json({ message: 'Airdrop deleted successfully' })
  } catch (error) {
    console.error('Error deleting airdrop:', error)
    return NextResponse.json(
      { error: 'Failed to delete airdrop' },
      { status: 500 }
    )
  }
}
