'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import VideoPlayer from '@/components/VideoPlayer'
import { hasValidPass, getRemainingMinutes } from '@/lib/coins'
import Link from 'next/link'

interface Channel {
  id: string
  name: string
  logoUrl: string
  streamUrl: string
  order: number
}

interface Program {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
}

export default function LiveTVPage() {
  const { user, token } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWarning, setShowWarning] = useState(false)
  const [mobileChannelListOpen, setMobileChannelListOpen] = useState(true)

  const userHasValidPass = user ? hasValidPass(user.passValidUntil) : false
  const remainingMinutes = user ? getRemainingMinutes(user.passValidUntil) : 0

  useEffect(() => {
    if (token) {
      fetchChannels()
    }
  }, [token])

  useEffect(() => {
    if (selectedChannel && token) {
      fetchCurrentProgram(selectedChannel.id)
    }
  }, [selectedChannel, token])

  useEffect(() => {
    if (remainingMinutes === 30 && !showWarning) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 30000)
    }
  }, [remainingMinutes])

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels/list', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setChannels(data.channels)
      if (data.channels.length > 0) {
        setSelectedChannel(data.channels[0])
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentProgram = async (channelId: string) => {
    try {
      const response = await fetch(`/api/epg/current?channelId=${channelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setCurrentProgram(data.program)
    } catch (error) {
      console.error('Failed to fetch program:', error)
    }
  }

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel)
    setMobileChannelListOpen(false)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-zinc-900">
          <div className="text-white">Laden...</div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-900 flex flex-col">
        <Navigation />
        
        {showWarning && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <span>Dein Pass läuft in 30 Minuten ab!</span>
            <Link href="/account" className="px-4 py-2 bg-black text-white rounded hover:bg-zinc-800">
              Paket einlösen
            </Link>
            <button onClick={() => setShowWarning(false)} className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600">
              Abbrechen
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col md:flex-row">
          {/* Channel List - Desktop */}
          <div className="hidden md:block w-80 bg-zinc-800 border-r border-zinc-700 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-white font-semibold mb-4">Sender</h2>
              <div className="space-y-2">
                {channels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelSelect(channel)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedChannel?.id === channel.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    {channel.logoUrl && (
                      <img src={channel.logoUrl} alt={channel.name} className="w-12 h-12 object-contain" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{channel.name}</div>
                      {selectedChannel?.id === channel.id && currentProgram && (
                        <div className="text-xs text-zinc-300 mt-1">{currentProgram.title}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Channel List */}
          <div className={`md:hidden bg-zinc-800 border-b border-zinc-700 ${mobileChannelListOpen ? 'block' : 'hidden'}`}>
            <div className="p-4 max-h-64 overflow-y-auto">
              <h2 className="text-white font-semibold mb-4">Sender auswählen</h2>
              <div className="space-y-2">
                {channels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelSelect(channel)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                  >
                    {channel.logoUrl && (
                      <img src={channel.logoUrl} alt={channel.name} className="w-10 h-10 object-contain" />
                    )}
                    <div className="flex-1 text-left font-medium">{channel.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1 flex flex-col p-4 pb-20 md:pb-4">
            {!userHasValidPass && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
                <p className="text-red-500 font-medium">Deine Restzeit ist abgelaufen. Bitte löse ein Paket ein.</p>
                <p className="text-zinc-400 mt-1">Verfügbare Coins: {user?.coins || 0}</p>
                <Link href="/account" className="inline-block mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Paket einlösen
                </Link>
              </div>
            )}

            <div className="md:hidden mb-4">
              <button
                onClick={() => setMobileChannelListOpen(!mobileChannelListOpen)}
                className="w-full py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600"
              >
                {mobileChannelListOpen ? 'Sender ausblenden' : 'Sender anzeigen'}
              </button>
            </div>

            {selectedChannel ? (
              <>
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-white">{selectedChannel.name}</h1>
                  {currentProgram && (
                    <p className="text-zinc-400 mt-1">{currentProgram.title}</p>
                  )}
                </div>
                <VideoPlayer
                  src={selectedChannel.streamUrl}
                  hasValidPass={userHasValidPass}
                  remainingMinutes={remainingMinutes}
                />
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 text-zinc-400">
                Kein Sender ausgewählt
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
