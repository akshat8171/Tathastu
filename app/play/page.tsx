import type { Metadata } from 'next'
import { PlayerBooth } from '@/components/play/player-booth'

export const metadata: Metadata = {
  title: 'Layer Rush',
  robots: { index: false, follow: false },
}

export default function PlayPage() {
  return <PlayerBooth />
}
