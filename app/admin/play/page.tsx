import type { Metadata } from 'next'
import { HostConsole } from '@/components/play/host-console'

export const metadata: Metadata = {
  title: 'Layer Rush host',
  robots: { index: false, follow: false },
}

export default function AdminPlayPage() {
  return (
    <div className="p-6">
      <HostConsole />
    </div>
  )
}
