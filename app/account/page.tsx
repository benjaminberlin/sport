'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import { formatRemainingTime, COIN_PACKAGES } from '@/lib/coins'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
}

export default function AccountPage() {
  const { user, token, refreshUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [redeemError, setRedeemError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && showHistory) {
      fetchTransactions()
    }
  }, [token, showHistory])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/users/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setTransactions(data.transactions)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const handleRedeemPackage = async (packageIndex: number) => {
    setRedeemError('')
    setLoading(true)
    try {
      const response = await fetch('/api/users/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ packageIndex })
      })

      if (!response.ok) {
        const data = await response.json()
        setRedeemError(data.error || 'Einlösung fehlgeschlagen')
        return
      }

      await refreshUser()
    } catch (error) {
      setRedeemError('Fehler beim Einlösen des Pakets')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/users/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      if (!response.ok) {
        const data = await response.json()
        setPasswordError(data.error || 'Passwortänderung fehlgeschlagen')
        return
      }

      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setShowPasswordForm(false), 2000)
    } catch (error) {
      setPasswordError('Fehler beim Ändern des Passworts')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-900 flex flex-col">
        <Navigation />
        
        <div className="flex-1 p-4 pb-20 md:pb-4 max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-white mb-8">Account</h1>

          {/* Status */}
          <div className="bg-zinc-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-zinc-400 text-sm mb-1">Restzeit</div>
                <div className="text-2xl font-bold text-white">
                  {formatRemainingTime(user.passValidUntil)}
                </div>
              </div>
              <div>
                <div className="text-zinc-400 text-sm mb-1">Verfügbare Coins</div>
                <div className="text-2xl font-bold text-white">{user.coins}</div>
              </div>
            </div>
          </div>

          {/* Package Redemption */}
          <div className="bg-zinc-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Paket einlösen</h2>
            {redeemError && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4 text-red-500 text-sm">
                {redeemError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COIN_PACKAGES.map((pkg, index) => (
                <button
                  key={index}
                  onClick={() => handleRedeemPackage(index)}
                  disabled={loading || user.coins < pkg.coins}
                  className="bg-zinc-700 rounded-lg p-4 hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-white font-semibold mb-2">{pkg.label}</div>
                  <div className="text-2xl font-bold text-blue-500 mb-2">{pkg.coins} Coin{pkg.coins !== 1 ? 's' : ''}</div>
                  {user.coins < pkg.coins && (
                    <div className="text-red-400 text-xs">Nicht genug Coins</div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-zinc-400 text-sm mt-4">
              Hinweis: Pakete verlängern deine verbleibende Zeit und ersetzen sie nicht.
            </p>
          </div>

          {/* Coin History */}
          <div className="bg-zinc-800 rounded-lg p-6 mb-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full text-white"
            >
              <h2 className="text-xl font-semibold">Coin-Verlauf</h2>
              {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {showHistory && (
              <div className="mt-4 space-y-2">
                {transactions.length > 0 ? (
                  transactions.map(transaction => (
                    <div key={transaction.id} className="bg-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{transaction.description}</div>
                          <div className="text-zinc-400 text-sm">
                            {transaction.type === 'package_redeem' 
                              ? format(new Date(transaction.createdAt), 'd. MMM yyyy, HH:mm')
                              : format(new Date(transaction.createdAt), 'd. MMM yyyy')
                            }
                          </div>
                        </div>
                        <div className={`text-lg font-semibold ${transaction.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-400 text-center py-4">Keine Transaktionen vorhanden</div>
                )}
              </div>
            )}
          </div>

          {/* Password Change */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex items-center justify-between w-full text-white mb-4"
            >
              <h2 className="text-xl font-semibold">Passwort ändern</h2>
              {showPasswordForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Aktuelles Passwort
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Neues Passwort
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {passwordError && (
                  <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-500 text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-500/10 border border-green-500 rounded-lg p-3 text-green-500 text-sm">
                    Passwort erfolgreich geändert!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Speichern...' : 'Passwort ändern'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
