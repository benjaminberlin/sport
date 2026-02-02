import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request)
  if (error) return error

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        coins: true,
        passValidUntil: true,
        lastOnline: true,
        moviesEnabled: true,
        seriesEnabled: true,
        createdAt: true
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const { userId, action, amount } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'UserId and action are required' },
        { status: 400 }
      )
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (action === 'add_coins' || action === 'remove_coins') {
      if (!amount || amount <= 0) {
        return NextResponse.json(
          { error: 'Valid amount is required' },
          { status: 400 }
        )
      }

      const newCoins = action === 'add_coins'
        ? targetUser.coins + amount
        : Math.max(0, targetUser.coins - amount)

      await prisma.user.update({
        where: { id: userId },
        data: { coins: newCoins }
      })

      // Create transaction
      await prisma.transaction.create({
        data: {
          userId: userId,
          type: 'admin_grant',
          amount: action === 'add_coins' ? amount : -amount,
          description: `Admin ${user.username} ${action === 'add_coins' ? 'added' : 'removed'} ${amount} coins`
        }
      })
    } else if (action === 'toggle_movies') {
      await prisma.user.update({
        where: { id: userId },
        data: { moviesEnabled: !targetUser.moviesEnabled }
      })
    } else if (action === 'toggle_series') {
      await prisma.user.update({
        where: { id: userId },
        data: { seriesEnabled: !targetUser.seriesEnabled }
      })
    } else if (action === 'delete') {
      await prisma.user.delete({
        where: { id: userId }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
