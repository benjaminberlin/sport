import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check session exists
    const session = await prisma.session.findUnique({
      where: { token }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update last online
    await prisma.user.update({
      where: { id: user.id },
      data: { lastOnline: new Date() }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        coins: user.coins,
        passValidUntil: user.passValidUntil,
        moviesEnabled: user.moviesEnabled,
        seriesEnabled: user.seriesEnabled
      }
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}
