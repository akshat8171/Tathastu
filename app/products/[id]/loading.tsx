import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading state for individual product detail page
 */
export default function Loading() {
  return (
    <main className="bg-white min-h-screen">
      {/* Breadcrumb skeleton */}
      <nav className="bg-surface border-b border-gray-100">
        <div className="container-page py-3">
          <Skeleton className="h-4 w-64" />
        </div>
      </nav>

      <div className="container-page py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery skeleton */}
          <div className="space-y-4">
            <Skeleton className="w-full aspect-square rounded-card" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded" />
              ))}
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-16" />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-12 w-32" />
            </div>

            {/* Add to cart buttons */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-pill" />
              <Skeleton className="h-12 w-full rounded-pill" />
            </div>

            {/* Features */}
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Related products section skeleton */}
        <div className="mt-16">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-square rounded-card" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
