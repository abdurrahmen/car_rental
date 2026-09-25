'use client'

import React, { useState } from 'react'
import type { Language } from '@/types'

export interface HeroVideoPlaceholderProps {
  locale: Language
}

/**
 * Apple-style Cinematic Promotional Video Placeholder.
 *
 * HOW TO USE WITH A REAL PROMO VIDEO:
 * When you receive the video, replace the inner container with your <video> tag or <iframe>:
 * ```tsx
 * <video
 *   src="/videos/promo.mp4"
 *   poster="/images/video-poster.jpg"
 *   controls
 *   autoPlay
 *   muted
 *   loop
 *   playsInline
 *   className="w-full h-full object-cover rounded-3xl"
 * />
 * ```
 */
export function HeroVideoPlaceholder({ locale }: HeroVideoPlaceholderProps) {
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'
  const [isPlayingMock, setIsPlayingMock] = useState(false)

  return (
    <div className="w-full relative group">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 bg-gradient-to-tr from-brand-500/20 via-accent-500/10 to-purple-500/15 rounded-[36px] blur-2xl opacity-60 group-hover:opacity-85 transition-opacity duration-500"
      />

      {/* Main Video Frame */}
      <div className="relative w-full aspect-[16/10] sm:aspect-video rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-white/10 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] flex flex-col justify-between p-5 sm:p-7 select-none">
        {/* Subtle background grid & ambient light inside player */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(0, 113, 227, 0.3) 0%, transparent 70%)',
          }}
        />

        {/* Top Player Chrome */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white/90">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{isArabic ? 'عرض سينمائي بدقة 4K' : isFrench ? 'Aperçu 4K HDR' : '4K Cinematic Preview'}</span>
          </div>

          <span className="text-[11px] font-mono tracking-wider text-white/50 uppercase">
            DZRENT • 58 WILAYAS
          </span>
        </div>

        {/* Center Play Button & Title */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-4">
          <button
            type="button"
            onClick={() => setIsPlayingMock((prev) => !prev)}
            aria-label="Play promotional video"
            className="apple-press w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 hover:bg-brand-500/90 text-white backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105 cursor-pointer mb-4"
          >
            {isPlayingMock ? (
              <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 sm:w-8 sm:h-8 ms-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight mb-1.5">
            {isArabic
              ? 'الفيديو الترويجي قريباً'
              : isFrench
              ? 'Vidéo promotionnelle à venir'
              : 'Promotional Video Coming Soon'}
          </h3>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed px-4">
            {isArabic
              ? 'شاهد أسطولنا يقطع أجمل مسارات الجزائر من الساحل إلى الصحراء مع محضر الفحص الرقمي.'
              : isFrench
              ? 'Découvrez notre flotte sur les plus belles routes d Algérie avec état des lieux contradictoire.'
              : 'Experience our fleet across Algeria s scenic routes with digital condition guarantee.'}
          </p>
        </div>

        {/* Bottom Mock Timeline */}
        <div className="relative z-10 w-full flex flex-col gap-2 pt-2">
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
            <div
              className={`h-full bg-brand-500 rounded-full transition-all duration-700 ${
                isPlayingMock ? 'w-2/5 animate-pulse' : 'w-1/6'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
            <span>{isPlayingMock ? '00:42' : '00:00'}</span>
            <span>01:45</span>
          </div>
        </div>
      </div>
    </div>
  )
}
