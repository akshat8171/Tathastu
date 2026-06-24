'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface ScrollRailProps {
  children: React.ReactNode
  /** Extra classes for the scrolling track (e.g. gap utilities). */
  className?: string
  /** Accessible label for the rail region. */
  ariaLabel?: string
}

/**
 * Generic horizontal scroll-snap rail with floating prev/next arrows.
 *
 * - Native CSS scroll-snap → smooth touch/trackpad swiping, SSR-safe.
 * - Arrows are progressive enhancement: they appear only when there's
 *   content to scroll to in that direction, and hide at the edges.
 * - Each direct child should carry its own snap-align + width classes
 *   (callers control item sizing, so the same rail works for cards,
 *   category tiles, etc.).
 */
export function ScrollRail({ children, className = '', ariaLabel }: ScrollRailProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanPrev(scrollLeft > 4)
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateArrows()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [updateArrows])

  const scrollByDir = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    // Scroll by ~85% of the viewport width so the next card peeks in.
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div className="relative group/rail">
      {/* Prev */}
      <button
        type="button"
        onClick={() => scrollByDir(-1)}
        aria-label="Scroll left"
        tabIndex={canPrev ? 0 : -1}
        className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20
          w-10 h-10 rounded-full bg-white shadow-card-hover items-center justify-center
          text-ink hover:bg-brand hover:text-white transition-all duration-200
          ${canPrev ? 'opacity-0 group-hover/rail:opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        className={`flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar
          -mx-4 px-4 sm:mx-0 sm:px-0 ${className}`}
      >
        {children}
      </div>

      {/* Next */}
      <button
        type="button"
        onClick={() => scrollByDir(1)}
        aria-label="Scroll right"
        tabIndex={canNext ? 0 : -1}
        className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20
          w-10 h-10 rounded-full bg-white shadow-card-hover items-center justify-center
          text-ink hover:bg-brand hover:text-white transition-all duration-200
          ${canNext ? 'opacity-0 group-hover/rail:opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  )
}
