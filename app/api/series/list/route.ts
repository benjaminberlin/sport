import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    if (!user.seriesEnabled) {
      return NextResponse.json(
        { error: 'Series access not enabled for this user' },
        { status: 403 }
      )
    }

    const series = await prisma.series.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        episodes: {
          orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }]
        }
      }
    })

    return NextResponse.json({ series })
  } catch (error) {
    console.error('Get series error:', error)
    return NextResponse.json(
      { error: 'Failed to get series' },
      { status: 500 }
    )
  }
}
