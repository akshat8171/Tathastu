import type { Metadata, Viewport } from 'next'
import { PlayerApp } from '@/components/tower/player-app'

export const metadata: Metadata = {
  title: 'Tathastu Tower',
  description: 'Stack the tallest tower and win a Tathastu keepsake.',
  robots: { index: false, follow: false },
}

// The root layout owns the viewport meta; the canvas blocks pinch/scroll with touch-action: none.
export const viewport: Viewport = { themeColor: '#16182B' }

export default function TowerPage() {
  return <PlayerApp />
}
