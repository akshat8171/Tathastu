import type { Metadata } from 'next'
import { StallScreen } from '@/components/tower/stall-screen'

export const metadata: Metadata = {
  title: 'Tathastu Tower — Leaderboard',
  robots: { index: false, follow: false },
}

export default function TowerScreenPage() {
  return <StallScreen />
}
