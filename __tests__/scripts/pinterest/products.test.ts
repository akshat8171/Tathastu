/**
 * @jest-environment node
 */

import {
  normalizeProducts,
  buildPublicImageUrl,
  selectProduct,
  rankProducts,
} from '@/scripts/pinterest/products'
import type { Product, PostedLog } from '@/scripts/pinterest/types'

// ── normalizeProducts ─────────────────────────────────────────────────────────
describe('normalizeProducts', () => {
  it('keeps valid products and drops ones missing id/name/images', () => {
    const raw = [
      { id: 'a', name: 'Alpha', images: ['/images/a.jpg'], category: 'lamps', price: 100 },
      { id: '', name: 'No id', images: ['/x.jpg'] }, // dropped: no id
      { id: 'b', name: 'Beta', images: [] }, // dropped: no images
      { id: 'c', name: '', images: ['/y.jpg'] }, // dropped: no name
      null, // dropped: not an object
      'nope', // dropped: not an object
    ]
    const out = normalizeProducts(raw as unknown[])
    expect(out.map((p) => p.id)).toEqual(['a'])
  })

  it('defaults optional fields safely', () => {
    const out = normalizeProducts([{ id: 'a', name: 'Alpha', images: ['/a.jpg'] }])
    expect(out[0]).toMatchObject({ description: '', category: '', price: 0 })
    expect(out[0]!.originalPrice).toBeUndefined()
  })

  it('filters non-string entries out of the images array', () => {
    const out = normalizeProducts([
      { id: 'a', name: 'Alpha', images: ['/a.jpg', 42, null, '/b.jpg'] },
    ])
    expect(out[0]!.images).toEqual(['/a.jpg', '/b.jpg'])
  })

  it('drops empty/whitespace-only image paths, and the product if none remain', () => {
    const out = normalizeProducts([
      { id: 'a', name: 'Alpha', images: ['', '   ', '/good.jpg'] }, // keeps only /good.jpg
      { id: 'b', name: 'Beta', images: ['', '  '] }, // no usable image → dropped
    ])
    expect(out.map((p) => p.id)).toEqual(['a'])
    expect(out[0]!.images).toEqual(['/good.jpg'])
  })
})

// ── buildPublicImageUrl ───────────────────────────────────────────────────────
describe('buildPublicImageUrl', () => {
  const origin = 'https://www.tathastukeepsakes.in'

  it('prefixes a relative path with the site origin', () => {
    expect(buildPublicImageUrl('/images/products/lamps/lamp1/x.jpg', origin)).toBe(
      'https://www.tathastukeepsakes.in/images/products/lamps/lamp1/x.jpg',
    )
  })

  it('adds a leading slash when the path lacks one', () => {
    expect(buildPublicImageUrl('images/a.jpg', origin)).toBe(
      'https://www.tathastukeepsakes.in/images/a.jpg',
    )
  })

  it('strips a trailing slash from the origin', () => {
    expect(buildPublicImageUrl('/a.jpg', 'https://x.in/')).toBe('https://x.in/a.jpg')
  })

  it('passes through an already-absolute raw URL', () => {
    const abs = 'https://cdn.example.com/a.jpg'
    expect(buildPublicImageUrl(abs, origin)).toBe(abs)
  })

  it('rejects the Next.js image-optimizer form', () => {
    expect(() => buildPublicImageUrl('/_next/image?url=%2Fa.jpg&w=640&q=75', origin)).toThrow(
      /optimizer/i,
    )
  })
})

// ── selectProduct (rotation) ──────────────────────────────────────────────────
describe('selectProduct', () => {
  const products: Product[] = [
    { id: 'p1', name: 'One', description: '', images: ['/1.jpg'], category: '', price: 0 },
    { id: 'p2', name: 'Two', description: '', images: ['/2.jpg'], category: '', price: 0 },
    { id: 'p3', name: 'Three', description: '', images: ['/3.jpg'], category: '', price: 0 },
  ]

  const emptyLog: PostedLog = { version: 1, posts: [] }

  it('throws on an empty catalog', () => {
    expect(() => selectProduct([], emptyLog)).toThrow(/empty/i)
  })

  it('picks the first never-posted product (catalog order) when nothing posted', () => {
    expect(selectProduct(products, emptyLog).id).toBe('p1')
  })

  it('prefers a never-posted product over any posted one', () => {
    const log: PostedLog = {
      version: 1,
      posts: [
        rec('p1', '2026-07-01T00:00:00.000Z'),
        rec('p3', '2026-07-02T00:00:00.000Z'),
      ],
    }
    // p2 is the only never-posted product → it wins.
    expect(selectProduct(products, log).id).toBe('p2')
  })

  it('when all posted, picks the least-recently-posted', () => {
    const log: PostedLog = {
      version: 1,
      posts: [
        rec('p1', '2026-07-05T00:00:00.000Z'),
        rec('p2', '2026-07-01T00:00:00.000Z'), // oldest
        rec('p3', '2026-07-03T00:00:00.000Z'),
      ],
    }
    expect(selectProduct(products, log).id).toBe('p2')
  })

  it('uses the most-recent post per product (not the first)', () => {
    const log: PostedLog = {
      version: 1,
      posts: [
        rec('p1', '2026-07-01T00:00:00.000Z'),
        rec('p1', '2026-07-09T00:00:00.000Z'), // p1 most-recent = 07-09
        rec('p2', '2026-07-02T00:00:00.000Z'),
        rec('p3', '2026-07-03T00:00:00.000Z'),
      ],
    }
    // p2 (07-02) is now the oldest most-recent post.
    expect(selectProduct(products, log).id).toBe('p2')
  })

  it('is deterministic: repeated calls yield the same choice', () => {
    const log: PostedLog = { version: 1, posts: [rec('p1', '2026-07-05T00:00:00.000Z')] }
    const a = selectProduct(products, log).id
    const b = selectProduct(products, log).id
    expect(a).toBe(b)
  })

  it('ignores malformed timestamps, treating that product as never-posted', () => {
    const log: PostedLog = {
      version: 1,
      posts: [rec('p1', 'not-a-date'), rec('p2', '2026-07-01T00:00:00.000Z')],
    }
    // p1's timestamp is unparseable → it's treated as never-posted (−∞), tying
    // with the genuinely-never-posted p3. The deterministic catalog-order
    // tie-break then picks p1 (index 0) over p3. Never crashes; p2 (validly
    // posted) is never chosen while an unposted candidate exists.
    expect(selectProduct(products, log).id).toBe('p1')
  })
})

// ── rankProducts (full ordering, for candidate-skipping in run.ts) ────────────
describe('rankProducts', () => {
  const products: Product[] = [
    { id: 'p1', name: 'One', description: '', images: ['/1.jpg'], category: '', price: 0 },
    { id: 'p2', name: 'Two', description: '', images: ['/2.jpg'], category: '', price: 0 },
    { id: 'p3', name: 'Three', description: '', images: ['/3.jpg'], category: '', price: 0 },
  ]

  it('returns every product, best candidate first', () => {
    const out = rankProducts(products, { version: 1, posts: [] })
    expect(out.map((p) => p.id)).toEqual(['p1', 'p2', 'p3'])
  })

  it('orders never-posted (catalog order) before posted, oldest-posted next', () => {
    const log: PostedLog = {
      version: 1,
      posts: [
        rec('p1', '2026-07-05T00:00:00.000Z'),
        rec('p3', '2026-07-01T00:00:00.000Z'), // posted earlier than p1
      ],
    }
    // p2 never posted → first; then p3 (older post) before p1 (newer post).
    expect(rankProducts(products, log).map((p) => p.id)).toEqual(['p2', 'p3', 'p1'])
  })

  it('selectProduct equals the head of rankProducts', () => {
    const log: PostedLog = { version: 1, posts: [rec('p1', '2026-07-05T00:00:00.000Z')] }
    expect(selectProduct(products, log).id).toBe(rankProducts(products, log)[0]!.id)
  })

  it('is a stable, deterministic ordering', () => {
    const log: PostedLog = { version: 1, posts: [rec('p2', '2026-07-05T00:00:00.000Z')] }
    expect(rankProducts(products, log).map((p) => p.id)).toEqual(
      rankProducts(products, log).map((p) => p.id),
    )
  })

  it('returns an empty array for an empty catalog', () => {
    expect(rankProducts([], { version: 1, posts: [] })).toEqual([])
  })
})

// Helper to build a PostRecord tersely.
function rec(productId: string, postedAt: string) {
  return {
    productId,
    pinId: `pin-${productId}`,
    boardId: 'b1',
    boardName: 'Board',
    title: 't',
    link: 'https://x.in/products/' + productId,
    postedAt,
  }
}
