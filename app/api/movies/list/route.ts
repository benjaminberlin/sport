import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    if (!user.moviesEnabled) {
      return NextResponse.json(
        { error: 'Movies access not enabled for this user' },
        { status: 403 }
      )
    }

    const movies = await prisma.movie.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ movies })
  } catch (error) {
    console.error('Get movies error:', error)
    return NextResponse.json(
      { error: 'Failed to get movies' },
      { status: 500 }
    )
  }
}
