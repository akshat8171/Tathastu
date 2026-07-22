/**
 * seo.ts — Generates SEO-optimized Pinterest metadata with Claude.
 *
 * Contract (from Akshat's original brief):
 *   - title:            catchy, <100 chars, hook + primary keyword
 *   - description:      engaging, <500 chars, 3–4 natural related search terms, NO hashtags
 *   - board_suggestion: a broad category
 *
 * The Zod schema enforces shape + length at DECODE time via zodOutputFormat, so
 * the model literally cannot return an off-contract object. A post-parse
 * sanitizer strips any stray hashtags (fail-open: we'd rather clean one "#" than
 * fail the whole day's Pin).
 *
 * IMPORTANT (verified against the installed SDK): the Anthropic zod helper is
 * typed against `zod/v4`. Installed zod is 3.25.x, which ships the v4 API under
 * the `zod/v4` subpath — so we import from there, NOT the default `zod` (still
 * v3 in 3.25.x). Mixing them causes a type/runtime mismatch.
 *
 * The SDK is ESM-only; it is imported dynamically INSIDE generateSeo so this
 * module's pure exports (schema, sanitizeSeo, limits) stay importable from Jest
 * (CommonJS) without loading the SDK.
 */

import * as z from 'zod/v4'
import type { Product, SeoContent } from './types'

// ── Hard limits (single source of truth; also used by tests) ────────────────
export const TITLE_MAX = 100
export const DESCRIPTION_MAX = 500 // Pinterest API allows 800; spec caps at 500.
export const BOARD_MAX = 60

// ── The SEO output contract, enforced at decode time ────────────────────────
export const SeoSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(TITLE_MAX)
    .describe('Catchy Pinterest pin title: a hook plus the primary keyword. Under 100 characters.'),
  description: z
    .string()
    .min(1)
    .max(DESCRIPTION_MAX)
    .describe(
      'Engaging description under 500 characters. Weave in 3–4 natural related search terms. ' +
        'Absolutely NO hashtags.',
    ),
  board_suggestion: z
    .string()
    .min(1)
    .max(BOARD_MAX)
    .describe('A broad Pinterest board category, 2–4 words, e.g. "3D Printed Pooja Decor".'),
})

/**
 * ★ LEARNING-MODE HOOK #2 — the SEO persona/voice (see design spec §6).
 *
 * This system prompt is where brand voice + keyword strategy live. Default
 * encodes the "expert Pinterest SEO marketer for an Indian 3D-printing gift
 * store" brief. Tune tone, keyword aggressiveness, or CTA style here.
 */
export const SEO_SYSTEM_PROMPT = [
  'You are an expert Pinterest SEO marketer for Tathastu Keepsakes, a premium custom',
  '3D-printing and personalised-keepsakes store based in Agra, India, shipping PAN-India.',
  'Brand promise: "If it exists, we can print it." Warm, gift-focused, Indian-market voice.',
  '',
  'Given ONE product, produce Pinterest metadata that ranks and converts:',
  '- title: a catchy hook plus the primary keyword a shopper would search. Under 100 chars.',
  '- description: engaging and specific. Naturally weave in 3–4 related search terms',
  '  (gifting occasions, materials, use-cases). Mention it is custom/personalised and',
  '  made-to-order in India where it fits. End with a soft call to action. Under 500 chars.',
  '  NEVER use hashtags or the "#" character.',
  '- board_suggestion: a broad, evergreen board category (2–4 words).',
  '',
  'Write for real humans first, search second. No emoji spam, no ALL CAPS, no price claims',
  'unless given. Do not invent product features that are not implied by the input.',
].join('\n')

/** Builds the per-product user message from catalog fields. */
export function buildSeoUserPrompt(product: Product): string {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? ` (originally ₹${product.originalPrice})`
      : ''
  return [
    `Product name: ${product.name}`,
    `Category: ${product.category || 'custom 3D-printed keepsake'}`,
    product.price ? `Price: ₹${product.price}${discount}` : '',
    product.description ? `Product description: ${product.description}` : '',
    '',
    'Generate the Pinterest title, description, and board_suggestion.',
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Removes hashtags while preserving readable copy. Fail-open safety net behind
 * the schema + prompt. Strips "#word" tokens and any lone "#", then tidies the
 * resulting whitespace. Also clamps to the max length as a final guard.
 */
export function sanitizeSeo(seo: SeoContent): SeoContent {
  const stripHashtags = (s: string): string =>
    s
      .replace(/#\w+/g, '') // "#3DPrinting" → ""
      .replace(/#/g, '') // any lone "#"
      .replace(/[ \t]{2,}/g, ' ') // collapse runs of spaces
      .replace(/\s+([.,!?])/g, '$1') // no space before punctuation
      .replace(/\n{3,}/g, '\n\n') // collapse blank lines
      .trim()

  const clamp = (s: string, max: number): string =>
    s.length <= max ? s : s.slice(0, max).trimEnd()

  return {
    title: clamp(stripHashtags(seo.title), TITLE_MAX),
    description: clamp(stripHashtags(seo.description), DESCRIPTION_MAX),
    board_suggestion: clamp(stripHashtags(seo.board_suggestion), BOARD_MAX),
  }
}

/**
 * Generates + validates SEO metadata for a product via Claude.
 *
 * Uses claude-opus-4-8 with structured output (zodOutputFormat). Adaptive
 * thinking is intentionally NOT enabled: constrained decoding is the hard
 * requirement, the task is bounded copywriting, and this keeps the request
 * correct-by-construction. Non-streaming is correct — the output is small.
 *
 * @param product the catalog product to describe
 * @param apiKey  the Anthropic API key (from config)
 */
export async function generateSeo(product: Product, apiKey: string): Promise<SeoContent> {
  // Dynamic import keeps the ESM-only SDK out of Jest's CommonJS graph.
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const { zodOutputFormat } = await import('@anthropic-ai/sdk/helpers/zod')

  const client = new Anthropic({ apiKey })

  const message = await client.messages.parse({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    system: SEO_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildSeoUserPrompt(product) }],
    output_config: { format: zodOutputFormat(SeoSchema) },
  })

  const parsed = message.parsed_output
  if (!parsed) {
    throw new Error(`SEO generation returned no parsed output for product ${product.id}.`)
  }

  return sanitizeSeo(parsed)
}
