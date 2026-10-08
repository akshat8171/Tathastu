import type { Metadata } from 'next'
import { CrowdScreen } from '@/components/play/crowd-screen'

export const metadata: Metadata = {
  title: 'Layer Rush screen',
  robots: { index: false, follow: false },
}

export default function PlayScreenPage() {
  return <CrowdScreen />
}
