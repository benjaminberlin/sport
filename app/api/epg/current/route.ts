import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
      return NextResponse.json(
        { error: 'channelId is required' },
        { status: 400 }
      )
    }

    const now = new Date()
    const program = await prisma.program.findFirst({
      where: {
        channelId,
        startTime: { lte: now },
        endTime: { gte: now }
      }
    })

    return NextResponse.json({ program })
  } catch (error) {
    console.error('Get current program error:', error)
    return NextResponse.json(
      { error: 'Failed to get current program' },
      { status: 500 }
    )
  }
}
