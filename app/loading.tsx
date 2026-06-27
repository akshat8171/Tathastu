import { HeroSkeleton } from '@/components/ui/skeleton'

/**
 * Root loading state for the entire app
 */
export default function Loading() {
  return (
    <div className="min-h-screen">
      <HeroSkeleton />
    </div>
  )
}
