/**
 * @jest-environment node
 *
 * Pure-logic tests for seo.ts: the Zod output contract, the fail-open hashtag
 * sanitizer, prompt assembly, and the exported limits. No network, no SDK — the
 * ESM-only Anthropic client is dynamically imported inside generateSeo(), which
 * these tests never call, so importing this module stays Jest-safe.
 */

import {
  SeoSchema,
  sanitizeSeo,
  buildSeoUserPrompt,
  TITLE_MAX,
  DESCRIPTION_MAX,
  BOARD_MAX,
} from '@/scripts/pinterest/seo'
import type { Product } from '@/scripts/pinterest/types'

// ── limits ────────────────────────────────────────────────────────────────────
describe('SEO limits', () => {
  it('match the spec (title 100, description 500, board 60)', () => {
    expect(TITLE_MAX).toBe(100)
    expect(DESCRIPTION_MAX).toBe(500)
    expect(BOARD_MAX).toBe(60)
  })
})

// ── SeoSchema (decode-time contract) ────────────────────────────────────────────
describe('SeoSchema', () => {
  const valid = {
    title: 'Custom 3D Printed Lunar Night Lamp — Personalised Gift',
    description: 'A warm, made-to-order keepsake for weddings and anniversaries.',
    board_suggestion: '3D Printed Pooja Decor',
  }

  it('accepts a well-formed object', () => {
    expect(SeoSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a title over 100 characters', () => {
    const res = SeoSchema.safeParse({ ...valid, title: 'x'.repeat(TITLE_MAX + 1) })
    expect(res.success).toBe(false)
  })

  it('accepts a title at exactly 100 characters', () => {
    const res = SeoSchema.safeParse({ ...valid, title: 'x'.repeat(TITLE_MAX) })
    expect(res.success).toBe(true)
  })

  it('rejects a description over 500 characters', () => {
    const res = SeoSchema.safeParse({ ...valid, description: 'x'.repeat(DESCRIPTION_MAX + 1) })
    expect(res.success).toBe(false)
  })

  it('rejects a board_suggestion over 60 characters', () => {
    const res = SeoSchema.safeParse({ ...valid, board_suggestion: 'x'.repeat(BOARD_MAX + 1) })
    expect(res.success).toBe(false)
  })

  it('rejects empty strings (min length 1)', () => {
    expect(SeoSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
    expect(SeoSchema.safeParse({ ...valid, description: '' }).success).toBe(false)
    expect(SeoSchema.safeParse({ ...valid, board_suggestion: '' }).success).toBe(false)
  })

  it('rejects missing fields', () => {
    expect(SeoSchema.safeParse({ title: 'a', description: 'b' }).success).toBe(false)
  })
})

// ── sanitizeSeo (fail-open hashtag stripping + clamp) ───────────────────────────
describe('sanitizeSeo', () => {
  it('strips "#word" hashtags from all fields', () => {
    const out = sanitizeSeo({
      title: 'Lunar Night Lamp #3DPrinting #gift',
      description: 'Great for #Diwali and #Rakhi celebrations.',
      board_suggestion: 'Pooja Decor #ideas',
    })
    expect(out.title).not.toMatch(/#/)
    expect(out.description).not.toMatch(/#/)
    expect(out.board_suggestion).not.toMatch(/#/)
    expect(out.title).toBe('Lunar Night Lamp')
  })

  it('strips lone "#" characters', () => {
    const out = sanitizeSeo({
      title: 'Best # Gift',
      description: 'a # b',
      board_suggestion: 'Decor',
    })
    expect(out.title).toBe('Best Gift')
    expect(out.description).toBe('a b')
  })

  it('does not leave a dangling space before punctuation after stripping', () => {
    const out = sanitizeSeo({
      title: 'Lovely gift #handmade.',
      description: 'Shop now #custom!',
      board_suggestion: 'Gifts',
    })
    expect(out.title).toBe('Lovely gift.')
    expect(out.description).toBe('Shop now!')
  })

  it('clamps over-length fields to the max', () => {
    const out = sanitizeSeo({
      title: 'a'.repeat(TITLE_MAX + 50),
      description: 'b'.repeat(DESCRIPTION_MAX + 50),
      board_suggestion: 'c'.repeat(BOARD_MAX + 50),
    })
    expect(out.title.length).toBeLessThanOrEqual(TITLE_MAX)
    expect(out.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
    expect(out.board_suggestion.length).toBeLessThanOrEqual(BOARD_MAX)
  })

  it('leaves clean copy untouched', () => {
    const clean = {
      title: 'Custom Lunar Night Lamp Gift',
      description: 'A made-to-order keepsake for weddings.',
      board_suggestion: '3D Printed Pooja Decor',
    }
    expect(sanitizeSeo(clean)).toEqual(clean)
  })
})

// ── buildSeoUserPrompt ──────────────────────────────────────────────────────────
describe('buildSeoUserPrompt', () => {
  const base: Product = {
    id: 'p1',
    name: 'Lunar Night Lamp',
    description: 'A glowing lunar keepsake.',
    images: ['/a.jpg'],
    category: 'lamps',
    price: 1499,
  }

  it('includes the product name and category', () => {
    const prompt = buildSeoUserPrompt(base)
    expect(prompt).toContain('Lunar Night Lamp')
    expect(prompt).toContain('lamps')
  })

  it('includes the price when present', () => {
    expect(buildSeoUserPrompt(base)).toContain('₹1499')
  })

  it('shows an original price only when it is higher than the price', () => {
    const withDiscount = buildSeoUserPrompt({ ...base, originalPrice: 1999 })
    expect(withDiscount).toContain('originally ₹1999')

    const noDiscount = buildSeoUserPrompt({ ...base, originalPrice: 1000 })
    expect(noDiscount).not.toContain('originally')
  })

  it('falls back to a generic category when none is set', () => {
    const prompt = buildSeoUserPrompt({ ...base, category: '' })
    expect(prompt).toContain('custom 3D-printed keepsake')
  })

  it('omits the price line entirely when price is 0', () => {
    const prompt = buildSeoUserPrompt({ ...base, price: 0 })
    expect(prompt).not.toContain('Price:')
  })
})
