'use client'

import { useEffect, useRef, useState } from 'react'

export function useNow(serverNow: number): number {
  const offset = useRef(0)
  const [now, setNow] = useState(() => serverNow || Date.now())

  useEffect(() => {
    if (serverNow > 0) offset.current = serverNow - Date.now()
  }, [serverNow])

  useEffect(() => {
    let frame = 0
    const loop = () => {
      setNow(Date.now() + offset.current)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  return now
}

export function useElapsed(startsAt: number, serverNow: number, running: boolean): number {
  const offset = useRef(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (serverNow > 0) offset.current = serverNow - Date.now()
  }, [serverNow])

  useEffect(() => {
    if (!running || startsAt <= 0) return
    let frame = 0
    const loop = () => {
      setElapsed(Date.now() + offset.current - startsAt)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [running, startsAt])

  return elapsed
}
