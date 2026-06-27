import { ProductGridSkeleton, Skeleton } from '@/components/ui/skeleton'

/**
 * Loading state for products catalog page
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

      {/* Hero band skeleton */}
      <section className="bg-surface border-b border-gray-100">
        <div className="container-page py-8 md:py-10">
          <div className="max-w-2xl space-y-4">
            {/* Tag skeleton */}
            <Skeleton className="h-3 w-32" />

            {/* Title skeleton */}
            <Skeleton className="h-9 w-64" />

            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Trust chips skeleton */}
            <div className="flex flex-wrap gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-32 rounded-pill" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main content skeleton */}
      <div className="container-page py-8">
        {/* Mobile filter skeleton */}
        <div className="mb-6 lg:hidden">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar skeleton */}
          <aside className="hidden lg:block w-56 flex-shrink-0 space-y-6">
            {/* Category filters skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>

            {/* Price filters skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-20" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </aside>

          {/* Product grid skeleton */}
          <div className="flex-1 min-w-0">
            {/* Sort controls skeleton */}
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-9 w-40" />
            </div>

            {/* Product cards skeleton */}
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </div>
    </main>
  )
}
