'use client'

import { useEffect, useRef } from 'react'
import { DROP_COUNT, DROP_WINDOW_MS } from '@/lib/play/constants'
import { activeDropIndex, gateX, idealTapMs, nozzleX } from '@/lib/play/scoring'

interface PrintBedProps {
  seed: number
  elapsedMs: number
  tapsMs: number[]
  showGate: boolean
}

export function PrintBed({ seed, elapsedMs, tapsMs, showGate }: PrintBedProps) {
  const nozzleRef = useRef<HTMLDivElement>(null)
  const dropIndex = activeDropIndex(Math.max(0, elapsedMs))
  const gate = gateX(seed, dropIndex)
  const gatePercent = ((gate + 1) / 2) * 100

  useEffect(() => {
    const node = nozzleRef.current
    if (!node) return
    const x = nozzleX(seed, Math.max(0, elapsedMs))
    node.style.left = `${((x + 1) / 2) * 100}%`
  }, [seed, elapsedMs])

  return (
    <div className="w-full">
      <div className="relative h-28 rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
        {showGate && (
          <div
            className="absolute top-3 bottom-3 w-1 -translate-x-1/2 rounded-full bg-amber-300"
            style={{ left: `${gatePercent}%` }}
          />
        )}
        <div
          ref={nozzleRef}
          className="absolute top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_24px_rgba(14,122,102,0.85)]"
        >
          <span className="absolute left-1/2 top-full h-6 w-0.5 -translate-x-1/2 bg-brand-300" />
        </div>
      </div>
      <div className="mt-4 flex flex-col-reverse gap-1.5 min-h-[9.5rem]">
        {Array.from({ length: DROP_COUNT }, (_, index) => (
          <Layer key={index} seed={seed} index={index} tapsMs={tapsMs} elapsedMs={elapsedMs} />
        ))}
      </div>
    </div>
  )
}

function Layer({
  seed,
  index,
  tapsMs,
  elapsedMs,
}: {
  seed: number
  index: number
  tapsMs: number[]
  elapsedMs: number
}) {
  const windowStart = index * DROP_WINDOW_MS
  const tap = tapsMs.find((value) => value >= windowStart && value < windowStart + DROP_WINDOW_MS)
  if (tap === undefined || tap > elapsedMs) {
    return <div className="h-2 rounded-full bg-white/5" />
  }
  const error = Math.abs(tap - idealTapMs(index))
  const aligned = error <= 80
  const shift = nozzleX(seed, tap) * 18
  return (
    <div className="h-2 rounded-full bg-white/5">
      <div
        className={`h-2 rounded-full ${aligned ? 'bg-brand' : 'bg-amber-200/80'}`}
        style={{ width: `${Math.max(18, 100 - error / 4)}%`, marginLeft: `${50 + shift}%`, transform: 'translateX(-50%)' }}
      />
    </div>
  )
}
