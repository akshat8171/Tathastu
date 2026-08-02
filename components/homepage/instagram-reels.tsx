'use client'

/**
 * InstagramReels — marquee of real reel covers + in-page Instagram embed player.
 *
 * Covers are local product stills (CDN thumbs are blocked without Graph API).
 * Play opens Instagram's official embed iframe so video plays on-site.
 */

import { useCallback, useEffect, useId, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
  INSTAGRAM_REELS,
  getReelEmbedUrl,
  getReelPermalink,
  type InstagramReel,
} from '@/lib/instagram-reels'

export function InstagramReels() {
  const [activeReel, setActiveReel] = useState<InstagramReel | null>(null)
  const titleId = useId()
  // Duplicate once for seamless CSS marquee (translateX -50%)
  const marqueeReels = [...INSTAGRAM_REELS, ...INSTAGRAM_REELS]

  const closePlayer = useCallback(() => {
    setActiveReel(null)
  }, [])

  useEffect(() => {
    if (!activeReel) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') closePlayer()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeReel, closePlayer])

  return (
    <section
      className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white"
      aria-label="Instagram Reels"
    >
      <div className="container-page">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Follow us on Instagram
          </h2>
          <Link
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 transition-colors"
          >
            @{INSTAGRAM_HANDLE}
            <InstagramGlyph className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="group flex">
            <div className="flex gap-4 animate-[marquee-scroll_28s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
              {marqueeReels.map((reel, index) => (
                <button
                  key={`${reel.id}-${index}`}
                  type="button"
                  onClick={() => setActiveReel(reel)}
                  className="flex-shrink-0 group/card text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  aria-label={`Play Instagram reel: ${reel.title}`}
                >
                  <div className="relative w-[120px] h-[213px] sm:w-[150px] sm:h-[266px] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-200">
                    <Image
                      src={reel.thumbnail}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 120px, 150px"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 group-hover/card:bg-white flex items-center justify-center shadow-lg transition-all duration-300 group-hover/card:scale-110">
                        <svg
                          className="w-6 h-6 sm:w-7 sm:h-7 text-brand ml-1"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </div>
                    <span className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                      <InstagramGlyph className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeReel ? (
        <ReelPlayerModal
          reel={activeReel}
          titleId={titleId}
          onClose={closePlayer}
        />
      ) : null}
    </section>
  )
}

interface ReelPlayerModalProps {
  readonly reel: InstagramReel
  readonly titleId: string
  readonly onClose: () => void
}

function ReelPlayerModal({ reel, titleId, onClose }: ReelPlayerModalProps) {
  const permalink = getReelPermalink(reel.shortcode)
  const embedUrl = getReelEmbedUrl(reel.shortcode)

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
          <h3 id={titleId} className="text-sm font-semibold text-gray-900 truncate">
            {reel.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Close reel player"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="relative w-full bg-black aspect-[9/16] max-h-[70vh]">
          <iframe
            key={reel.shortcode}
            src={embedUrl}
            title={`Instagram reel: ${reel.title}`}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Playing via Instagram embed
          </p>
          <a
            href={permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            Open on Instagram
          </a>
        </div>
      </div>
    </div>
  )
}

function InstagramGlyph({ className }: { readonly className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
        clipRule="evenodd"
      />
    </svg>
  )
}
