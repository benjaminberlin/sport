'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import { Play } from 'lucide-react'

interface Movie {
  id: string
  title: string
  description: string | null
  posterUrl: string | null
  videoUrl: string
  year: number | null
  duration: number | null
}

export default function MoviesPage() {
  const { token, user } = useAuth()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  useEffect(() => {
    if (token && user?.moviesEnabled) {
      fetchMovies()
    }
  }, [token, user])

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies/list', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setMovies(data.movies || [])
    } catch (error) {
      console.error('Failed to fetch movies:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user?.moviesEnabled) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-zinc-900 flex flex-col">
          <Navigation />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-zinc-400">
              <p className="text-xl">Filme sind für deinen Account nicht freigeschaltet.</p>
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
            <h1 className="text-3xl font-bold text-white mb-8">Filme</h1>

            {movies.length === 0 ? (
              <div className="text-center text-zinc-400 py-12">
                <p className="text-xl">Keine Filme verfügbar</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.map(movie => (
                  <button
                    key={movie.id}
                    onClick={() => setSelectedMovie(movie)}
                    className="group relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                  >
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
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
                      <p className="text-white text-sm font-medium truncate">{movie.title}</p>
                      {movie.year && (
                        <p className="text-zinc-300 text-xs">{movie.year}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Movie Player Modal */}
        {selectedMovie && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-5xl">
              <div className="bg-zinc-800 rounded-lg overflow-hidden">
                <div className="aspect-video bg-black">
                  <video
                    src={selectedMovie.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                  <div className="flex items-center gap-4 text-zinc-400 text-sm mb-4">
                    {selectedMovie.year && <span>{selectedMovie.year}</span>}
                    {selectedMovie.duration && <span>{selectedMovie.duration} min</span>}
                  </div>
                  {selectedMovie.description && (
                    <p className="text-zinc-300 mb-4">{selectedMovie.description}</p>
                  )}
                  <button
                    onClick={() => setSelectedMovie(null)}
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
