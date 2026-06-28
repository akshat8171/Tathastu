'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const safeImages = images.length > 0 ? images : ['/images/categories/lamps.jpg']

  function goToPrev() {
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))
  }
  function goToNext() {
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main image ────────────────────────────────────────────────────────── */}
      <div className="relative aspect-square bg-panel rounded-card2 overflow-hidden group">
        <Image
          src={safeImages[activeIndex]}
          alt={`${productName} — view ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Prev / Next arrows — only if multiple images */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow-card flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow-card flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        {safeImages.length > 1 && (
          <span className="absolute bottom-3 right-3 z-10 bg-black/40 text-white text-xs font-sans px-2.5 py-1 rounded-pill backdrop-blur-sm">
            {activeIndex + 1} / {safeImages.length}
          </span>
        )}
      </div>

      {/* ── Thumbnail strip ───────────────────────────────────────────────────── */}
      {safeImages.length > 1 && (
        <div
          role="tablist"
          aria-label="Product images"
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`View image ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                idx === activeIndex
                  ? 'border-brand shadow-sm'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="72px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
