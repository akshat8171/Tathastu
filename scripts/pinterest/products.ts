/**
 * products.ts — Catalog loading, public image-URL building, and product rotation.
 *
 * All functions here are PURE (no network, no env, no SDK) so they are trivially
 * unit-testable and safe to import from Jest. The one side-effecting function,
 * loadProducts(), only reads a local JSON file.
 */

import type { Product, PostedLog } from './types'

/**
 * Loads the catalog from lib/products.json and narrows it to the Product shape.
 * The source file has many more fields; we read only what the pin needs.
 */
export function loadProducts(): Product[] {
  // Resolved relative to repo root at runtime (tsx) — see run.ts for cwd contract.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const raw = require('../../lib/products.json') as unknown[]
  return normalizeProducts(raw)
}

/** Coerces raw JSON records into typed Products, dropping anything unusable. */
export function normalizeProducts(raw: unknown[]): Product[] {
  const out: Product[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    const id = typeof r.id === 'string' ? r.id : ''
    const name = typeof r.name === 'string' ? r.name : ''
    const images = Array.isArray(r.images)
      ? r.images.filter((i): i is string => typeof i === 'string' && i.trim() !== '')
      : []
    // A product with no id, name, or image can't become a Pin — skip it.
    if (!id || !name || images.length === 0) continue
    out.push({
      id,
      name,
      description: typeof r.description === 'string' ? r.description : '',
      images,
      category: typeof r.category === 'string' ? r.category : '',
      price: typeof r.price === 'number' ? r.price : 0,
      originalPrice: typeof r.originalPrice === 'number' ? r.originalPrice : undefined,
    })
  }
  return out
}

/**
 * Builds a publicly-reachable image URL Pinterest can fetch.
 *
 * products.json stores relative paths ("/images/products/.../x.jpg") which
 * Next.js serves from public/ at the site root. We must return the RAW asset
 * URL, never the "/_next/image?url=..." optimizer form (Pinterest needs a
 * direct image response, and the optimizer requires query params + can 404).
 *
 * @throws if handed an already-optimized ("/_next/image") path.
 */
export function buildPublicImageUrl(relativePath: string, siteOrigin: string): string {
  const path = relativePath.trim()
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Already absolute — trust it, but still reject the optimizer form.
    if (path.includes('/_next/image')) {
      throw new Error(`Refusing Next.js image-optimizer URL (not a raw asset): ${path}`)
    }
    return path
  }
  if (path.includes('/_next/image')) {
    throw new Error(`Refusing Next.js image-optimizer URL (not a raw asset): ${path}`)
  }
  const origin = siteOrigin.replace(/\/+$/, '')
  const rel = path.startsWith('/') ? path : `/${path}`
  return `${origin}${rel}`
}

/**
 * ★ LEARNING-MODE HOOK #1 — rotation policy (see design spec §6).
 *
 * Default: LEAST-RECENTLY-POSTED. Products never posted come first (in catalog
 * order, for determinism); then products whose most-recent successful post is
 * oldest. This exhausts the whole catalog before any product repeats.
 *
 * Tuning ideas (Akshat): weight by price band to push hero SKUs, round-robin by
 * category so consecutive days vary, or seasonal boosting near festivals. The
 * signature is stable — swap the body and every consumer keeps working.
 *
 * Pure function: identical (products, log) always yields the same ORDER.
 *
 * @returns every product, best candidate first. Empty input → empty output.
 */
export function rankProducts(products: Product[], log: PostedLog): Product[] {
  // Most-recent post time per productId (epoch ms). Absent = never posted.
  const lastPostedAt = new Map<string, number>()
  for (const post of log.posts) {
    const t = Date.parse(post.postedAt)
    if (Number.isNaN(t)) continue
    const prev = lastPostedAt.get(post.productId)
    if (prev === undefined || t > prev) lastPostedAt.set(post.productId, t)
  }

  // Sort by oldest most-recent-post time (never-posted = -Infinity, so first),
  // with the original catalog index as a stable, deterministic tie-break.
  return products
    .map((p, index) => ({
      p,
      index,
      lastTime: lastPostedAt.get(p.id) ?? Number.NEGATIVE_INFINITY,
    }))
    .sort((a, b) => a.lastTime - b.lastTime || a.index - b.index)
    .map((e) => e.p)
}

/**
 * The single best product to post next (the head of rankProducts).
 *
 * Pure function: identical (products, log) always yields the same choice.
 *
 * @throws if the catalog is empty.
 */
export function selectProduct(products: Product[], log: PostedLog): Product {
  if (products.length === 0) {
    throw new Error('Cannot select a product: the catalog is empty.')
  }
  return rankProducts(products, log)[0]!
}
