'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import { format } from 'date-fns'

interface Channel {
  id: string
  name: string
  logoUrl: string
}

interface Program {
  id: string
  channelId: string
  title: string
  description: string | null
  startTime: string
  endTime: string
}

export default function TVGuidePage() {
  const { token } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [programs, setPrograms] = useState<{ [channelId: string]: Program[] }>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (token) {
      fetchChannels()
    }
  }, [token])

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels/list', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setChannels(data.channels)
      
      // For now, we'll just show current programs
      // In a full implementation, you'd fetch all programs for today
      for (const channel of data.channels) {
        fetchChannelPrograms(channel.id)
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChannelPrograms = async (channelId: string) => {
    try {
      const response = await fetch(`/api/epg/current?channelId=${channelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.program) {
        setPrograms(prev => ({
          ...prev,
          [channelId]: [data.program]
        }))
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error)
    }
  }

  const isCurrentProgram = (startTime: string, endTime: string) => {
    const now = new Date()
    return new Date(startTime) <= now && new Date(endTime) >= now
  }

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-gray-900">Laden...</div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Channel List */}
          <div className="md:w-64 bg-white border-r border-gray-300 md:overflow-y-auto">
            <div className="p-4">
              <input
                type="text"
                placeholder="Sender suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 md:hidden"
              />
              <h2 className="text-gray-900 font-semibold mb-4">Sender</h2>
              <div className="space-y-2">
                {filteredChannels.map(channel => (
                  <div
                    key={channel.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-100"
                  >
                    {channel.logoUrl && (
                      <img src={channel.logoUrl} alt={channel.name} className="w-10 h-10 object-contain" />
                    )}
                    <div className="font-medium text-gray-900">{channel.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Programs */}
          <div className="flex-1 overflow-x-auto pb-20 md:pb-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  TV-Programm - {format(new Date(), 'EEEE, d. MMMM yyyy')}
                </h1>
                <input
                  type="text"
                  placeholder="Sender suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hidden md:block w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-4">
                {filteredChannels.map(channel => {
                  const channelPrograms = programs[channel.id] || []
                  return (
                    <div key={channel.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        {channel.logoUrl && (
                          <img src={channel.logoUrl} alt={channel.name} className="w-12 h-12 object-contain" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{channel.name}</h3>
                      </div>

                      {channelPrograms.length > 0 ? (
                        <div className="space-y-2">
                          {channelPrograms.map(program => (
                            <div
                              key={program.id}
                              className={`p-3 rounded-lg ${
                                isCurrentProgram(program.startTime, program.endTime)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-medium">
                                  {format(new Date(program.startTime), 'HH:mm')} - {format(new Date(program.endTime), 'HH:mm')}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold">{program.title}</div>
                                  {program.description && (
                                    <div className="text-sm mt-1 opacity-80">{program.description}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-600 text-sm">Keine Programminformationen verfügbar</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
