/**
 * Price filter buckets — shared between server (catalog page) and client (filter sidebar).
 * Extracted to a standalone module so server components can import without 'use client' issues.
 */
export const PRICE_BUCKETS = [
  { label: 'Under ₹250',       value: '0-250',     min: 0,    max: 250  },
  { label: '₹250 – ₹500',      value: '250-500',   min: 250,  max: 500  },
  { label: '₹500 – ₹1,000',    value: '500-1000',  min: 500,  max: 1000 },
  { label: 'Over ₹1,000',      value: '1000+',     min: 1000, max: Infinity },
]

export type PriceBucket = (typeof PRICE_BUCKETS)[number]
