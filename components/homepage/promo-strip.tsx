'use client'

import { useState } from 'react'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'

const COUPON_CODE = 'FIRST20'

/**
 * PromoStrip — FIRST20 ticket banner (PR-01).
 * Teal→purple gradient, ticket icon, dashed code chip, copy-to-clipboard.
 */
export function PromoStrip() {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(COUPON_CODE)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="promo-gradient py-5 sm:py-6" aria-label="Promotional offer">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left">
          <div
            className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25"
            aria-hidden="true"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="font-display font-bold text-white text-lg sm:text-xl leading-tight">
              Get 20% OFF on your first order
            </p>
            <p className="font-sans text-white/85 text-sm mt-0.5">
              Orders over ₹{FREE_SHIPPING_THRESHOLD} · Free shipping · New customers only
            </p>
          </div>

          <div className="hidden sm:block w-px h-10 bg-white/30 flex-shrink-0" aria-hidden="true" />

          <div className="flex items-center gap-2">
            <span className="font-sans text-white/80 text-sm">Use code</span>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-2 rounded-btn border border-dashed border-white/80 bg-white/10 px-3.5 py-2 text-sm font-display font-bold tracking-widest text-white hover:bg-white/20 transition-colors"
              aria-label={copied ? 'Coupon code copied' : `Copy coupon code ${COUPON_CODE}`}
            >
              {COUPON_CODE}
              {copied ? (
                <span className="text-xs font-sans font-semibold tracking-normal text-white/95">Copied!</span>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
