import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export interface AuthenticatedUser {
  id: string
  email: string
  username: string
  role: string
  coins: number
  passValidUntil: Date | null
  moviesEnabled: boolean
  seriesEnabled: boolean
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: AuthenticatedUser | null; error: NextResponse | null }> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return {
      user: null,
      error: NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }
  }

  // Verify token
  const payload = verifyToken(token)
  if (!payload) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  // Check session exists
  const session = await prisma.session.findUnique({
    where: { token }
  })

  if (!session) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Session not found' }, { status: 401 })
    }
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  })

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
  }

  return { user, error: null }
}

export async function requireAuth(request: NextRequest): Promise<{ user: AuthenticatedUser; error: null } | { user: null; error: NextResponse }> {
  const { user, error } = await authenticateRequest(request)
  if (error) {
    return { user: null, error }
  }
  return { user: user!, error: null }
}

export async function requireAdmin(request: NextRequest): Promise<{ user: AuthenticatedUser; error: null } | { user: null; error: NextResponse }> {
  const { user, error } = await authenticateRequest(request)
  if (error) {
    return { user: null, error }
  }
  if (user!.role !== 'admin') {
    return {
      user: null,
      error: NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
  }
  return { user: user!, error: null }
}
