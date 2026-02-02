import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { calculateNewPassValidUntil, COIN_PACKAGES } from '@/lib/coins'

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const { packageIndex } = body

    if (packageIndex === undefined || packageIndex < 0 || packageIndex >= COIN_PACKAGES.length) {
      return NextResponse.json(
        { error: 'Invalid package index' },
        { status: 400 }
      )
    }

    const pkg = COIN_PACKAGES[packageIndex]

    // Check if user has enough coins
    if (user.coins < pkg.coins) {
      return NextResponse.json(
        { error: 'Insufficient coins' },
        { status: 400 }
      )
    }

    // Calculate new pass valid until
    const newPassValidUntil = calculateNewPassValidUntil(user.passValidUntil, pkg.hours)

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: user.coins - pkg.coins,
        passValidUntil: newPassValidUntil
      }
    })

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'package_redeem',
        amount: -pkg.coins,
        description: `Paket eingelöst: ${pkg.label} (${pkg.coins} Coins)`
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        coins: updatedUser.coins,
        passValidUntil: updatedUser.passValidUntil
      }
    })
  } catch (error) {
    console.error('Redeem package error:', error)
    return NextResponse.json(
      { error: 'Failed to redeem package' },
      { status: 500 }
    )
  }
}
