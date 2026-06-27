import { ProductGridSkeleton, Skeleton } from '@/components/ui/skeleton'

/**
 * Loading state for shop page
 */
export default function Loading() {
  return (
    <main className="bg-white min-h-screen">
      {/* Breadcrumb skeleton */}
      <nav className="bg-surface border-b border-gray-100">
        <div className="container-page py-3">
          <Skeleton className="h-4 w-48" />
        </div>
      </nav>

      {/* Hero section skeleton */}
      <section className="bg-surface border-b border-gray-100">
        <div className="container-page py-8 md:py-10">
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-64" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </section>

      {/* Product grid skeleton */}
      <div className="container-page py-8">
        <ProductGridSkeleton count={8} />
      </div>
    </main>
  )
}
