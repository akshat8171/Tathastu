'use client'

import { useEffect, useRef } from 'react'
import { IDLE_LIMIT_MS, LAYER_HEIGHT, MIN_TAP_GAP_MS, TRAVEL } from '@/lib/tower/constants'
import {
  createTower,
  currentLevel,
  dropSlab,
  layersPlaced,
  movingSlab,
  speedFor,
  type DropOutcome,
  type RunSummary,
  type Slab,
  type TowerState,
} from '@/lib/tower/engine'

/**
 * Canvas renderer + input loop for Tathastu Tower.
 *
 * Performance notes (this runs on whatever phone walks up to the stall):
 *  - One requestAnimationFrame loop, zero React renders per frame.
 *  - Plain 2D canvas, no shadows/filters, device pixel ratio capped at 2.
 *  - Only the top ~36 slabs are drawn; colours are cached per layer.
 *  - Tap time comes from the input event's own timestamp, so a busy frame
 *    never makes a tap land late.
 */

export interface DropEvent {
  outcome: DropOutcome
  intervals: number[]
  score: number
  layers: number
  combo: number
  perfects: number
}

interface TowerCanvasProps {
  seed: number
  mode: 'play' | 'demo'
  onDrop?: (event: DropEvent) => void
  onGameOver?: (intervals: number[], summary: RunSummary) => void
  className?: string
}

interface Falling {
  slab: Slab
  y: number
  vy: number
  hue: number
  front: boolean
}

interface Ripple {
  slab: Slab
  y: number
  born: number
}

const ISO_X = 0.8660254
const ISO_Y = 0.5
const VISIBLE_LAYERS = 36
const GRAVITY = 0.0016
const BASE_DEPTH = 900

export function TowerCanvas({ seed, mode, onDrop, onGameOver, className }: TowerCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDropRef = useRef(onDrop)
  const onGameOverRef = useRef(onGameOver)
  onDropRef.current = onDrop
  onGameOverRef.current = onGameOver

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let state: TowerState = createTower(seed)
    let intervals: number[] = []
    let spawnAt = performance.now()
    let lastFrame = spawnAt
    let camY = LAYER_HEIGHT
    let over = false
    let overAt = 0
    let falling: Falling[] = []
    let ripples: Ripple[] = []
    let width = 0
    let height = 0
    let scale = 1
    let frame = 0
    let demoNext = demoTapAt(state, spawnAt)
    const baseHue = seed % 360
    const colours = new Map<number, [string, string, string]>()

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Fit the base slab to about half the short side so the sliding slab has room.
      scale = (Math.min(width, height * 0.8) * 0.48) / (200 * ISO_X)
    }
    resize()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    observer?.observe(wrap)
    window.addEventListener('resize', resize)

    const hueOf = (layer: number) => (baseHue + layer * 6) % 360

    const paintBackground = () => {
      const hue = hueOf(layersPlaced(state))
      wrap.style.background = `linear-gradient(180deg, hsl(${hue} 42% 24%) 0%, hsl(${(hue + 40) % 360} 48% 10%) 100%)`
    }
    paintBackground()

    const colourOf = (layer: number): [string, string, string] => {
      const hue = hueOf(layer)
      let cached = colours.get(hue)
      if (!cached) {
        cached = [`hsl(${hue} 62% 64%)`, `hsl(${hue} 55% 50%)`, `hsl(${hue} 55% 38%)`]
        colours.set(hue, cached)
      }
      return cached
    }

    const project = (x: number, y: number, z: number, cy: number): [number, number] => [
      width / 2 + (x - z) * ISO_X * scale,
      cy + ((x + z) * ISO_Y - y) * scale,
    ]

    const drawBox = (slab: Slab, y0: number, y1: number, layer: number, cy: number) => {
      const [top, left, right] = colourOf(layer)
      const x0 = slab.x - slab.w / 2
      const x1 = slab.x + slab.w / 2
      const z0 = slab.z - slab.d / 2
      const z1 = slab.z + slab.d / 2
      const a = project(x0, y1, z0, cy)
      const b = project(x1, y1, z0, cy)
      const c = project(x1, y1, z1, cy)
      const d = project(x0, y1, z1, cy)
      const bLow = project(x1, y0, z0, cy)
      const cLow = project(x1, y0, z1, cy)
      const dLow = project(x0, y0, z1, cy)
      if (cLow[1] < -40 || a[1] > height + 40) return

      ctx.fillStyle = right
      ctx.beginPath()
      ctx.moveTo(b[0], b[1])
      ctx.lineTo(c[0], c[1])
      ctx.lineTo(cLow[0], cLow[1])
      ctx.lineTo(bLow[0], bLow[1])
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = left
      ctx.beginPath()
      ctx.moveTo(d[0], d[1])
      ctx.lineTo(c[0], c[1])
      ctx.lineTo(cLow[0], cLow[1])
      ctx.lineTo(dLow[0], dLow[1])
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = top
      ctx.beginPath()
      ctx.moveTo(a[0], a[1])
      ctx.lineTo(b[0], b[1])
      ctx.lineTo(c[0], c[1])
      ctx.lineTo(d[0], d[1])
      ctx.closePath()
      ctx.fill()
    }

    const drawRipple = (ripple: Ripple, now: number, cy: number) => {
      const age = (now - ripple.born) / 520
      if (age >= 1) return
      const grow = 1 + age * 0.35
      const s = ripple.slab
      const hw = (s.w / 2) * grow
      const hd = (s.d / 2) * grow
      const pts = [
        project(s.x - hw, ripple.y, s.z - hd, cy),
        project(s.x + hw, ripple.y, s.z - hd, cy),
        project(s.x + hw, ripple.y, s.z + hd, cy),
        project(s.x - hw, ripple.y, s.z + hd, cy),
      ]
      ctx.strokeStyle = `rgba(255,255,255,${(1 - age) * 0.9})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(pts[0][0], pts[0][1])
      for (let i = 1; i < 4; i += 1) ctx.lineTo(pts[i][0], pts[i][1])
      ctx.closePath()
      ctx.stroke()
    }

    const drop = (at: number) => {
      if (over) return
      const level = currentLevel(state)
      const top = state.slabs[state.slabs.length - 1]
      // Clamp like the server does: any wait past the idle limit is the same game over.
      const interval = Math.min(IDLE_LIMIT_MS + 1, Math.max(0, Math.round(at - spawnAt)))
      const outcome = dropSlab(state, interval)
      intervals.push(interval)
      spawnAt = Math.max(at, spawnAt + interval)

      if (outcome.chopped) {
        falling.push({
          slab: outcome.chopped,
          y: level * LAYER_HEIGHT,
          vy: 0,
          hue: level,
          front: outcome.chopped.x + outcome.chopped.z > top.x + top.z,
        })
        if (falling.length > 12) falling = falling.slice(-12)
      }
      if (outcome.kind === 'perfect' && outcome.placed) {
        ripples.push({ slab: outcome.placed, y: (level + 1) * LAYER_HEIGHT, born: at })
        if (ripples.length > 4) ripples = ripples.slice(-4)
      }
      paintBackground()

      if (mode === 'play') {
        onDropRef.current?.({
          outcome,
          intervals: intervals.slice(),
          score: state.score,
          layers: layersPlaced(state),
          combo: state.combo,
          perfects: state.perfects,
        })
      }

      if (state.over) {
        over = true
        overAt = at
        if (mode === 'play') {
          onGameOverRef.current?.(intervals.slice(), {
            score: state.score,
            layers: layersPlaced(state),
            perfects: state.perfects,
            bestCombo: state.bestCombo,
            over: true,
            used: intervals.length,
          })
        }
      } else if (mode === 'demo') {
        demoNext = demoTapAt(state, spawnAt)
      }
    }

    const step = (now: number) => {
      const dt = Math.min(64, now - lastFrame)
      lastFrame = now

      if (!over && mode === 'play' && now - spawnAt > IDLE_LIMIT_MS) drop(spawnAt + IDLE_LIMIT_MS + 1)
      if (!over && mode === 'demo' && now >= demoNext) drop(demoNext)
      if (over && mode === 'demo' && now - overAt > 1800) {
        state = createTower((seed + Math.floor(now)) >>> 0)
        intervals = []
        falling = []
        ripples = []
        over = false
        spawnAt = now
        camY = LAYER_HEIGHT
        demoNext = demoTapAt(state, spawnAt)
        paintBackground()
      }

      for (const piece of falling) {
        piece.vy += GRAVITY * dt
        piece.y -= piece.vy * dt
      }
      falling = falling.filter((piece) => piece.y > camY - 1200)

      const topY = state.slabs.length * LAYER_HEIGHT
      camY += (topY - camY) * Math.min(1, dt * 0.006)
      const cy = height * 0.46 + camY * scale

      ctx.clearRect(0, 0, width, height)
      for (const piece of falling) {
        if (!piece.front) drawBox(piece.slab, piece.y, piece.y + LAYER_HEIGHT, piece.hue, cy)
      }
      const first = Math.max(0, state.slabs.length - VISIBLE_LAYERS)
      for (let index = first; index < state.slabs.length; index += 1) {
        const bottom = index === 0 ? -BASE_DEPTH : index * LAYER_HEIGHT
        drawBox(state.slabs[index], bottom, (index + 1) * LAYER_HEIGHT, index, cy)
      }
      if (!over) {
        const level = currentLevel(state)
        drawBox(movingSlab(state, now - spawnAt), level * LAYER_HEIGHT, (level + 1) * LAYER_HEIGHT, level, cy)
      }
      for (const piece of falling) {
        if (piece.front) drawBox(piece.slab, piece.y, piece.y + LAYER_HEIGHT, piece.hue, cy)
      }
      for (const ripple of ripples) drawRipple(ripple, now, cy)
    }

    const loop = (now: number) => {
      try {
        step(now)
      } catch (error) {
        // A bad frame must never freeze the game — log it and keep going.
        console.error('Tower frame failed', error)
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    const tapTime = (event: Event) => {
      const now = performance.now()
      const stamp = event.timeStamp
      const at = stamp > 0 && Math.abs(now - stamp) < 1000 ? stamp : now
      return Math.max(spawnAt, at)
    }
    // A double tap or a second finger lands right after the next slab spawns, while it is
    // still at the far edge — a guaranteed miss. Ignore those; nothing is recorded, so the
    // server replay is unaffected.
    const playerTap = (event: Event) => {
      const at = tapTime(event)
      if (at - spawnAt < MIN_TAP_GAP_MS) return
      drop(at)
    }
    const onPointer = (event: PointerEvent) => {
      if (mode !== 'play') return
      if (event.button !== undefined && event.button > 0) return
      event.preventDefault()
      if (!event.isPrimary) return
      playerTap(event)
    }
    const onKey = (event: KeyboardEvent) => {
      if (mode !== 'play' || event.repeat) return
      if (event.code !== 'Space' && event.code !== 'Enter' && event.code !== 'ArrowDown') return
      event.preventDefault()
      playerTap(event)
    }
    wrap.addEventListener('pointerdown', onPointer, { passive: false })
    window.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      wrap.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [seed, mode])

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
    >
      <canvas ref={canvasRef} className="block" aria-label="Tathastu Tower game. Tap to drop the slab." role="img" />
    </div>
  )
}

/** The demo bot taps near dead centre and gets sloppier as the tower grows. */
function demoTapAt(state: TowerState, spawnAt: number): number {
  const level = currentLevel(state)
  const centred = TRAVEL / speedFor(level)
  const wobble = (Math.random() - 0.5) * (12 + level * 1.6)
  return spawnAt + centred + wobble
}
