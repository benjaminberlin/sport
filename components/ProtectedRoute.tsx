'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (adminOnly && user.role !== 'admin') {
        router.push('/live-tv')
      }
    }
  }, [user, loading, adminOnly, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="text-white">Laden...</div>
      </div>
    )
  }

  if (!user || (adminOnly && user.role !== 'admin')) {
    return null
  }

  return <>{children}</>
}
