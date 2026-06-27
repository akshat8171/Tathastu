import React from 'react'

/**
 * Base skeleton loading component with pulse animation
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-label="Loading..."
    />
  )
}

/**
 * Skeleton for a single product card
 */
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      {/* Image skeleton */}
      <div className="image-panel aspect-square">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />

        {/* Price */}
        <Skeleton className="h-6 w-1/3" />

        {/* Button */}
        <Skeleton className="h-10 w-full rounded-pill" />
      </div>
    </div>
  )
}

/**
 * Skeleton for product grid (multiple cards)
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for hero section
 */
export function HeroSkeleton() {
  return (
    <div className="relative w-full bg-gray-100">
      {/* Hero image skeleton */}
      <Skeleton className="w-full h-[400px] sm:h-[500px] lg:h-[600px]" />

      {/* Overlay content skeleton */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container-page text-center space-y-6 max-w-3xl">
          {/* Heading skeleton */}
          <Skeleton className="h-12 sm:h-16 w-3/4 mx-auto" />

          {/* Subheading skeleton */}
          <Skeleton className="h-6 w-2/3 mx-auto" />

          {/* CTA button skeleton */}
          <div className="flex justify-center pt-4">
            <Skeleton className="h-12 w-40 rounded-pill" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for page header section
 */
export function PageHeaderSkeleton() {
  return (
    <div className="container-page py-8 space-y-4">
      {/* Page title */}
      <Skeleton className="h-10 w-64" />

      {/* Subtitle or description */}
      <Skeleton className="h-5 w-96" />
    </div>
  )
}
