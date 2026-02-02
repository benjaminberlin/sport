'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import { Play, ChevronDown, ChevronUp } from 'lucide-react'

interface Episode {
  id: string
  title: string
  episodeNumber: number
  seasonNumber: number
  description: string | null
  videoUrl: string
  duration: number | null
}

interface Series {
  id: string
  title: string
  description: string | null
  posterUrl: string | null
  year: number | null
  episodes: Episode[]
}

export default function SeriesPage() {
  const { token, user } = useAuth()
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [expandedSeasons, setExpandedSeasons] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    if (token && user?.seriesEnabled) {
      fetchSeries()
    }
  }, [token, user])

  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/series/list', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setSeriesList(data.series || [])
    } catch (error) {
      console.error('Failed to fetch series:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeasons = (episodes: Episode[]) => {
    const seasons = new Map<number, Episode[]>()
    episodes.forEach(episode => {
      if (!seasons.has(episode.seasonNumber)) {
        seasons.set(episode.seasonNumber, [])
      }
      seasons.get(episode.seasonNumber)?.push(episode)
    })
    return Array.from(seasons.entries()).sort((a, b) => a[0] - b[0])
  }

  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeasons(prev => ({
      ...prev,
      [seasonNumber]: !prev[seasonNumber]
    }))
  }

  if (!user?.seriesEnabled) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-zinc-900 flex flex-col">
          <Navigation />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-zinc-400">
              <p className="text-xl">Serien sind für deinen Account nicht freigeschaltet.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
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
        
        <div className="flex-1 p-4 pb-20 md:pb-4">
          <div className="max-w-7xl mx-auto">
            {!selectedSeries ? (
              <>
                <h1 className="text-3xl font-bold text-white mb-8">Serien</h1>

                {seriesList.length === 0 ? (
                  <div className="text-center text-zinc-400 py-12">
                    <p className="text-xl">Keine Serien verfügbar</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {seriesList.map(series => (
                      <button
                        key={series.id}
                        onClick={() => {
                          setSelectedSeries(series)
                          setExpandedSeasons({ 1: true })
                        }}
                        className="group relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                      >
                        {series.posterUrl ? (
                          <img
                            src={series.posterUrl}
                            alt={series.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                            <span className="text-zinc-500">Kein Poster</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                          <p className="text-white text-sm font-medium truncate">{series.title}</p>
                          {series.year && (
                            <p className="text-zinc-300 text-xs">{series.year}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div>
                <button
                  onClick={() => setSelectedSeries(null)}
                  className="mb-6 text-blue-500 hover:text-blue-400"
                >
                  ← Zurück zur Übersicht
                </button>

                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  {selectedSeries.posterUrl && (
                    <div className="w-full md:w-64 aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={selectedSeries.posterUrl}
                        alt={selectedSeries.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-4">{selectedSeries.title}</h1>
                    {selectedSeries.year && (
                      <p className="text-zinc-400 mb-4">{selectedSeries.year}</p>
                    )}
                    {selectedSeries.description && (
                      <p className="text-zinc-300">{selectedSeries.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {getSeasons(selectedSeries.episodes).map(([seasonNumber, episodes]) => (
                    <div key={seasonNumber} className="bg-zinc-800 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSeason(seasonNumber)}
                        className="w-full flex items-center justify-between p-4 hover:bg-zinc-700 transition-colors"
                      >
                        <h2 className="text-xl font-semibold text-white">
                          Staffel {seasonNumber}
                        </h2>
                        {expandedSeasons[seasonNumber] ? (
                          <ChevronUp className="w-5 h-5 text-white" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white" />
                        )}
                      </button>

                      {expandedSeasons[seasonNumber] && (
                        <div className="p-4 space-y-2">
                          {episodes.map(episode => (
                            <button
                              key={episode.id}
                              onClick={() => setSelectedEpisode(episode)}
                              className="w-full flex items-center gap-4 p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-left"
                            >
                              <div className="flex-shrink-0 w-12 h-12 bg-zinc-600 rounded flex items-center justify-center">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-white font-medium">
                                  {episode.episodeNumber}. {episode.title}
                                </div>
                                {episode.description && (
                                  <div className="text-zinc-400 text-sm line-clamp-1">
                                    {episode.description}
                                  </div>
                                )}
                              </div>
                              {episode.duration && (
                                <div className="text-zinc-400 text-sm">
                                  {Math.floor(episode.duration / 60)} min
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Episode Player Modal */}
        {selectedEpisode && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-5xl">
              <div className="bg-zinc-800 rounded-lg overflow-hidden">
                <div className="aspect-video bg-black">
                  <video
                    src={selectedEpisode.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    S{selectedEpisode.seasonNumber}E{selectedEpisode.episodeNumber}: {selectedEpisode.title}
                  </h2>
                  {selectedEpisode.duration && (
                    <div className="text-zinc-400 text-sm mb-4">
                      {Math.floor(selectedEpisode.duration / 60)} min
                    </div>
                  )}
                  {selectedEpisode.description && (
                    <p className="text-zinc-300 mb-4">{selectedEpisode.description}</p>
                  )}
                  <button
                    onClick={() => setSelectedEpisode(null)}
                    className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
                  >
                    Schließen
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
