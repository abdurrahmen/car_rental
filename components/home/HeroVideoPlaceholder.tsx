'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import type { Language } from '@/types'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'

export interface HeroVideoPlaceholderProps {
  locale: Language
  videoSrc?: string
  className?: string
}

export function HeroVideoPlaceholder({
  locale,
  videoSrc = '/videos/hero_video.mp4',
  className = '',
}: HeroVideoPlaceholderProps) {
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle play/pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return

    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().then(() => {
        setIsPlaying(true)
        setIsEnded(false)
      }).catch(() => {
        // Autoplay policy or error
      })
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  // Handle mute toggle
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    const nextMuted = !videoRef.current.muted
    videoRef.current.muted = nextMuted
    setIsMuted(nextMuted)
  }, [])

  // Handle fullscreen
  const toggleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  // Handle seek via scrubber click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!videoRef.current || duration === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const clampedPos = Math.max(0, Math.min(1, pos))
    videoRef.current.currentTime = clampedPos * duration
  }

  // Handle user activity to show/hide controls
  const handleUserActivity = () => {
    setShowControls(true)
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current)
    }
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2500)
    }
  }

  // Time update event handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration || 0
    setCurrentTime(current)
    if (total > 0) {
      setProgress((current / total) * 100)
    }
  }

  // Metadata loaded event handler
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  // Attempt autoplay on mount
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.muted = true
      setIsMuted(true)
      video.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setIsPlaying(false)
      })
    }
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false)
      }}
      className={`w-full relative group cursor-pointer ${className}`}
      onClick={togglePlay}
    >
      {/* Ambient background glow (brand-500 + accent-500, zero purple) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 bg-gradient-to-tr from-brand-500/25 via-accent-500/10 to-brand-600/20 rounded-[36px] blur-2xl opacity-60 group-hover:opacity-85 transition-opacity duration-500"
      />

      {/* Main Video Frame with generous height aligned with hero text */}
      <div className="relative w-full h-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] xl:min-h-[620px] rounded-3xl overflow-hidden bg-neutral-950 border border-white/10 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] select-none flex flex-col justify-between">
        {/* Background ambient video blur when in letterbox / contain mode */}
        {fitMode === 'contain' && (
          <video
            src={videoSrc}
            muted
            autoPlay
            loop
            playsInline
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
          />
        )}

        {/* Video Element: crisp 1920x1080 resolution strictly preserved with 1:1 pixel aspect ratio */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 w-full h-full ${
            fitMode === 'cover' ? 'object-cover' : 'object-contain'
          } object-center transition-all duration-300`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsEnded(true)
            setIsPlaying(false)
          }}
          onPlay={() => {
            setIsPlaying(true)
            setIsEnded(false)
          }}
          onPause={() => setIsPlaying(false)}
        >
          {isArabic
            ? 'متصفحك لا يدعم تشغيل مقاطع الفيديو.'
            : isFrench
            ? 'Votre navigateur ne supporte pas la lecture de vidéos.'
            : 'Your browser does not support the video tag.'}
        </video>

        {/* Top Player Chrome */}
        <div className="relative z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isArabic
                ? 'فيديو ترويجي • 4K'
                : isFrench
                ? 'Aperçu Vidéo • 4K'
                : 'Cinematic Preview • 4K'}
            </span>
          </div>

          <span className="text-[11px] font-mono tracking-wider text-white/70 uppercase bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            DZRENT • 58 WILAYAS
          </span>
        </div>

        {/* Center Play/Pause Floating Action Button */}
        <div
          className={`relative z-20 my-auto flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
            !isPlaying || showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="apple-press w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/45 hover:bg-brand-500/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105">
            {isEnded ? (
              <RotateCcw className="w-7 h-7 sm:w-8 sm:h-8" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 ms-1" />
            )}
          </div>
        </div>

        {/* Bottom Interactive Controls Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative z-30 p-4 sm:p-5 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex flex-col gap-2.5 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress / Seek Bar */}
          <div
            onClick={handleSeek}
            className="w-full h-1.5 sm:h-2 bg-white/20 hover:bg-white/30 rounded-full overflow-hidden cursor-pointer relative transition-all"
            title="Seek"
          >
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Action Buttons & Time display */}
          <div className="flex items-center justify-between text-white text-xs pt-1">
            <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="hover:text-brand-400 p-1 rounded transition-colors focus:outline-none"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Volume / Mute Button */}
              <button
                type="button"
                onClick={toggleMute}
                className="hover:text-brand-400 p-1 rounded transition-colors focus:outline-none"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400" />
                )}
              </button>

              {/* Time readout */}
              <span className="text-[11px] font-mono text-white/80 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Aspect Ratio / Fit Mode Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFitMode((prev) => (prev === 'cover' ? 'contain' : 'cover'))
                }}
                className="hover:text-brand-400 p-1 rounded transition-colors focus:outline-none flex items-center gap-1 text-[11px] font-mono text-white/80"
                aria-label={fitMode === 'cover' ? 'Show Full 16:9 Frame' : 'Fill Tall Height'}
                title={
                  fitMode === 'cover'
                    ? isArabic
                      ? 'عرض الإطار الكامل 16:9'
                      : 'Fit 16:9 Frame'
                    : isArabic
                    ? 'ملء الارتفاع بالكامل'
                    : 'Fill Height'
                }
              >
                <span className="px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-bold">
                  {fitMode === 'cover' ? 'FILL' : 'FIT'}
                </span>
              </button>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hover:text-brand-400 p-1 rounded transition-colors focus:outline-none"
                aria-label="Toggle Fullscreen"
                title="Fullscreen"
              >
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
