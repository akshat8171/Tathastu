'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { Category } from '@/lib/categories'

interface CategoryFilterProps {
  categories: Category[]
  activeSlug: string | null
}

export function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  const allActive = !activeSlug || activeSlug === 'all'

  return (
    <nav aria-label="Filter by category">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <p className="font-display font-semibold text-xs uppercase tracking-wider text-muted mb-3">
          Categories
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              href="/products"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                allActive
                  ? 'bg-brand text-white font-semibold'
                  : 'text-ink hover:bg-panel hover:text-brand'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              All Products
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/products?category=${cat.slug}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSlug === cat.slug
                    ? 'bg-brand text-white font-semibold'
                    : 'text-ink hover:bg-panel hover:text-brand'
                }`}
              >
                <CategoryIcon slug={cat.slug} />
                {cat.displayName}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile chips */}
      <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Link
          href="/products"
          className={`flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-medium transition-colors border ${
            allActive
              ? 'bg-brand text-white border-brand'
              : 'bg-white text-ink border-gray-200 hover:border-brand hover:text-brand'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className={`flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-medium transition-colors border ${
              activeSlug === cat.slug
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-ink border-gray-200 hover:border-brand hover:text-brand'
            }`}
          >
            {cat.displayName}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function CategoryIcon({ slug }: { slug: string }) {
  switch (slug) {
    case 'lamps':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    case 'organizers':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    case 'planters':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      )
    default:
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
  }
}
