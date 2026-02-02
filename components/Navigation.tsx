'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Tv, Calendar, User, Settings, Film, Clapperboard, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) return null

  const navItems = [
    { href: '/live-tv', label: 'Live-TV', icon: Tv, show: true },
    { href: '/tv-guide', label: 'TV-Guide', icon: Calendar, show: true },
    { href: '/account', label: 'Account', icon: User, show: true },
    { href: '/settings/users', label: 'Settings', icon: Settings, show: user.role === 'admin' },
    { href: '/movies', label: 'Movies', icon: Film, show: user.moviesEnabled },
    { href: '/series', label: 'Series', icon: Clapperboard, show: user.seriesEnabled },
  ].filter(item => item.show)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-zinc-900 border-b border-zinc-800">
        <div className="w-full flex items-center px-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-zinc-400 hover:text-white transition-colors ml-auto"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 ${
                pathname === item.href ? 'text-blue-500' : 'text-zinc-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 p-2 text-zinc-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </>
  )
}
