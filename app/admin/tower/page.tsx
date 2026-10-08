import type { Metadata } from 'next'
import { TowerHostConsole } from '@/components/tower/host-console'

export const metadata: Metadata = {
  title: 'Tathastu Tower host',
  robots: { index: false, follow: false },
}

export default function AdminTowerPage() {
  return (
    <div className="p-6">
      <TowerHostConsole />
    </div>
  )
}
