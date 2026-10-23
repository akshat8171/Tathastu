'use client'

import { useEffect, useId, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, X } from 'lucide-react'
import type { ProductCardData } from '@/components/ui'

const STORAGE_KEY = 'tathastu-diwali-idols-banner'

interface DiwaliIdolsBannerProps {
  products: ProductCardData[]
}

/**
 * Expandable Diwali landing banner for the 8 car-dashboard idols.
 * Starts open on first visit; dismiss collapses to a slim bar that can re-expand.
 */
export function DiwaliIdolsBanner({ products }: DiwaliIdolsBannerProps) {
  const panelId = useId()
  const [expanded, setExpanded] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY)
      if (saved === 'collapsed') setExpanded(false)
    } catch {
      // sessionStorage may be unavailable — keep default expanded
    }
    setHydrated(true)
  }, [])

  function persist(next: boolean) {
    setExpanded(next)
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next ? 'expanded' : 'collapsed')
    } catch {
      // ignore
    }
  }

  if (products.length === 0) return null

  return (
    <section
      className="diwali-idols-banner border-b border-brand-800/20"
      aria-label="Diwali car dashboard idols"
      data-testid="diwali-idols-banner"
      data-expanded={expanded ? 'true' : 'false'}
      data-hydrated={hydrated ? 'true' : 'false'}
    >
      {/* Collapsed / always-visible bar */}
      <div className="container-page">
        <div className="flex items-center justify-between gap-3 py-3">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 text-left text-white"
            onClick={() => persist(!expanded)}
            aria-expanded={expanded}
            aria-controls={panelId}
          >
            <span
              className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-200 transition-transform duration-300 ${
                expanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-sm font-bold tracking-wide sm:text-base">
                This Diwali, order these idols from Tathastu
              </span>
              <span className="mt-0.5 block truncate font-sans text-xs text-white/75 sm:text-sm">
                8 car dashboard murtis · printed in Agra · flat base · gift-box packed
              </span>
            </span>
          </button>

          <div className="flex flex-shrink-0 items-center gap-2">
            {!expanded && (
              <button
                type="button"
                onClick={() => persist(true)}
                className="hidden rounded-pill bg-amber-400 px-3 py-1.5 font-display text-xs font-semibold text-brand-900 hover:bg-amber-300 sm:inline-flex"
              >
                View idols
              </button>
            )}
            {expanded && (
              <button
                type="button"
                onClick={() => persist(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Collapse Diwali idols banner"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable product grid */}
      <div
        id={panelId}
        role="region"
        aria-label="Diwali dashboard idol picks"
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="container-page pb-5 pt-1">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl font-sans text-sm text-white/85">
                Shop the Selfmini-style set — Baby Shiva, Shiva on Nandi, Ganesha, Krishna,
                Hanuman and Laxmi Ganesh. Tap Shop Now for the full product page.
              </p>
              <Link
                href="/products?category=pooja-decor"
                className="font-display text-sm font-semibold text-amber-200 underline-offset-2 hover:underline"
              >
                Browse all pooja decor
              </Link>
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {products.map((product) => (
                <li key={product.id}>
                  <IdolTile product={product} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function IdolTile({ product }: { product: ProductCardData }) {
  const shortName = shortenIdolName(product.name)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card2 bg-white/95 shadow-card transition-shadow duration-300 hover:shadow-card-hover">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-panel"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 12vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
        <h3 className="line-clamp-2 font-display text-[11px] font-semibold leading-snug text-ink sm:text-xs">
          {shortName}
        </h3>
        <p className="font-display text-sm font-bold text-brand">₹{product.price}</p>
        <Link
          href={`/products/${product.id}`}
          className="mt-auto inline-flex items-center justify-center rounded-pill bg-brand px-2.5 py-1.5 text-center font-display text-[11px] font-semibold text-white transition-colors hover:bg-brand-600 sm:text-xs"
        >
          Shop Now
        </Link>
      </div>
    </article>
  )
}

/** Strip catalog filler so tiles stay readable in a dense 8-up grid. */
function shortenIdolName(name: string): string {
  return name
    .replace(/\s*Car Dashboard Idol\s*/gi, ' ')
    .replace(/\s*Idol\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}
