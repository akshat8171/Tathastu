'use client'

/**
 * InfiniteMarquee — seamless horizontal loop via translateX(-50%).
 *
 * Two equal-width sets sit side by side. Each set uses the same gap and a
 * trailing padding equal to that gap so the join between sets matches
 * internal spacing (critical for a jump-free -50% loop).
 */

import type { ReactNode } from 'react'

interface InfiniteMarqueeProps {
  children: ReactNode
  /** Seconds for one full loop of the original set. */
  durationSec?: number
  className?: string
  /** Tailwind gap utility applied inside each set (default gap-4). */
  gapClassName?: string
  /** Matching trailing padding so set join equals internal gap (default pe-4). */
  trailClassName?: string
  ariaLabel?: string
  /** When true, pause CSS animation (e.g. parent hover/focus). */
  paused?: boolean
  pauseOnHover?: boolean
}

export function InfiniteMarquee({
  children,
  durationSec = 40,
  className = '',
  gapClassName = 'gap-4',
  trailClassName = 'pe-4',
  ariaLabel,
  paused = false,
  pauseOnHover = true,
}: InfiniteMarqueeProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} aria-label={ariaLabel}>
      <div className={pauseOnHover ? 'group' : undefined}>
        <div
          className={`flex w-max flex-nowrap animate-[marquee-scroll_var(--marquee-duration)_linear_infinite] motion-reduce:animate-none ${
            pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
          }`}
          style={{
            ['--marquee-duration' as string]: `${durationSec}s`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          <div className={`flex flex-nowrap shrink-0 ${gapClassName} ${trailClassName}`}>
            {children}
          </div>
          <div
            className={`flex flex-nowrap shrink-0 ${gapClassName} ${trailClassName}`}
            aria-hidden="true"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
