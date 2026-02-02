import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const channels = await prisma.channel.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Get channels error:', error)
    return NextResponse.json(
      { error: 'Failed to get channels' },
      { status: 500 }
    )
  }
}
