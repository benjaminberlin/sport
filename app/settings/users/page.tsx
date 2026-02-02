'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import { format } from 'date-fns'
import { Plus, Minus, History, Edit2, Trash2, Circle } from 'lucide-react'

interface User {
  id: string
  email: string
  username: string
  role: string
  coins: number
  passValidUntil: string | null
  lastOnline: string | null
  moviesEnabled: boolean
  seriesEnabled: boolean
}

export default function UsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (token) {
      fetchUsers()
    }
  }, [token])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCoinChange = async (userId: string, action: 'add_coins' | 'remove_coins', amount: number) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, action, amount })
      })

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update coins:', error)
    }
  }

  const handleUpdateUser = async (userId: string, updates: { moviesEnabled?: boolean, seriesEnabled?: boolean }) => {
    try {
      // Toggle movies if changed
      if (updates.moviesEnabled !== undefined) {
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId, action: 'toggle_movies' })
        })
      }

      // Toggle series if changed
      if (updates.seriesEnabled !== undefined) {
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId, action: 'toggle_series' })
        })
      }

      await fetchUsers()
      setShowEditModal(false)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Benutzer wirklich löschen?')) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, action: 'delete' })
      })

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const isOnline = (lastOnline: string | null) => {
    if (!lastOnline) return false
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return new Date(lastOnline) > fiveMinutesAgo
  }

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-gray-900">Laden...</div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        
        <div className="flex-1 p-4 pb-20 md:pb-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Benutzerverwaltung</h1>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Online</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Benutzername</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rolle</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Coins</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Zuletzt Online</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Pass gültig bis</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3">
                        <Circle
                          className={`w-3 h-3 ${isOnline(user.lastOnline) ? 'text-green-500 fill-green-500' : 'text-gray-400'}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-900">{user.username}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCoinChange(user.id, 'remove_coins', 1)}
                            className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-gray-900 font-medium w-8 text-center">{user.coins}</span>
                          <button
                            onClick={() => handleCoinChange(user.id, 'add_coins', 1)}
                            className="p-1 bg-green-600 hover:bg-green-700 rounded text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">
                        {user.lastOnline ? format(new Date(user.lastOnline), 'd. MMM yyyy, HH:mm') : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">
                        {user.passValidUntil ? format(new Date(user.passValidUntil), 'd. MMM yyyy, HH:mm') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(user)
                              setShowEditModal(true)
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                            title="Bearbeiten"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded text-white"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {users.map(user => (
                <div key={user.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Circle
                        className={`w-3 h-3 ${isOnline(user.lastOnline) ? 'text-green-500 fill-green-500' : 'text-gray-400'}`}
                      />
                      <span className="text-gray-900 font-semibold">{user.username}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coins:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCoinChange(user.id, 'remove_coins', 1)}
                          className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-gray-900 font-medium w-6 text-center">{user.coins}</span>
                        <button
                          onClick={() => handleCoinChange(user.id, 'add_coins', 1)}
                          className="p-1 bg-green-600 hover:bg-green-700 rounded text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zuletzt Online:</span>
                      <span className="text-gray-700">
                        {user.lastOnline ? format(new Date(user.lastOnline), 'd. MMM, HH:mm') : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pass gültig bis:</span>
                      <span className="text-gray-700">
                        {user.passValidUntil ? format(new Date(user.passValidUntil), 'd. MMM, HH:mm') : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingUser(user)
                        setShowEditModal(true)
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Benutzer bearbeiten</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-gray-900">
                    <input
                      type="checkbox"
                      checked={editingUser.moviesEnabled}
                      onChange={(e) => setEditingUser({ ...editingUser, moviesEnabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Movies aktiviert
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-900">
                    <input
                      type="checkbox"
                      checked={editingUser.seriesEnabled}
                      onChange={(e) => setEditingUser({ ...editingUser, seriesEnabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Series aktiviert
                  </label>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => {
                      const updates: { moviesEnabled?: boolean, seriesEnabled?: boolean } = {}
                      const currentUser = users.find(u => u.id === editingUser.id)
                      if (currentUser && currentUser.moviesEnabled !== editingUser.moviesEnabled) {
                        updates.moviesEnabled = editingUser.moviesEnabled
                      }
                      if (currentUser && currentUser.seriesEnabled !== editingUser.seriesEnabled) {
                        updates.seriesEnabled = editingUser.seriesEnabled
                      }
                      handleUpdateUser(editingUser.id, updates)
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingUser(null)
                    }}
                    className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 rounded text-gray-900"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
