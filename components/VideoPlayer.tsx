'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  src: string
  hasValidPass: boolean
  remainingMinutes: number
  onWarningShown?: () => void
}

export default function VideoPlayer({ src, hasValidPass, remainingMinutes, onWarningShown }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    if (!videoRef.current || !src) return

    const video = videoRef.current

    if (Hls.isSupported()) {
      const hls = new Hls()
      hlsRef.current = hls
      hls.loadSource(src)
      hls.attachMedia(video)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (hasValidPass) {
          video.play().catch(err => console.error('Autoplay failed:', err))
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      if (hasValidPass) {
        video.play().catch(err => console.error('Autoplay failed:', err))
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [src, hasValidPass])

  return (
    <div className="relative w-full aspect-video bg-black">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
      />
      
      {!hasValidPass && (
        <div className="absolute inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center">
          <div className="text-white text-center p-8">
            <p className="text-xl mb-2">Zugriff gesperrt</p>
            <p className="text-sm text-zinc-300">Dein Pass ist abgelaufen</p>
          </div>
        </div>
      )}

      {hasValidPass && remainingMinutes > 0 && remainingMinutes <= 30 && (
        <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none" />
      )}
    </div>
  )
}
