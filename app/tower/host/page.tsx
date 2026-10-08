import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TowerHostConsole } from '@/components/tower/host-console'
import { TOWER_MEMORY_STORE } from '@/lib/tower/repository'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tathastu Tower host (local)',
  robots: { index: false, follow: false },
}

/** Local-dev host console (in-memory store, no login). The real one is /admin/tower. */
export default function LocalTowerHostPage() {
  if (!TOWER_MEMORY_STORE) notFound()
  return (
    <div className="min-h-dvh bg-gray-50 p-6">
      <p className="mx-auto mb-4 max-w-6xl rounded-xl bg-amber-100 px-4 py-2 text-sm text-amber-900">
        Local dev mode: data is kept in memory and resets when the server stops. On the live site, use /admin/tower.
      </p>
      <TowerHostConsole apiBase="/api/tower/dev-host" />
    </div>
  )
}
