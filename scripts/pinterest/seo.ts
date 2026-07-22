/**
 * seo.ts — Generates SEO-optimized Pinterest metadata with Google Gemini.
 *
 * Contract (from Akshat's original brief):
 *   - title:            catchy, <100 chars, hook + primary keyword
 *   - description:      engaging, <500 chars, 3–4 natural related search terms, NO hashtags
 *   - board_suggestion: a broad category
 *
 * Gemini's structured-output mode (responseMimeType 'application/json' +
 * responseSchema) constrains the reply to the shape below, so the model returns
 * a parseable JSON object. A post-parse sanitizer then strips any stray hashtags
 * and clamps lengths (fail-open: we'd rather clean/trim one field than fail the
 * whole day's Pin) — which is why the post-parse validation here is intentionally
 * lenient on length: sanitizeSeo is the hard length backstop.
 *
 * NOTE on the zod import: SeoSchema is defined with the zod v4 API. Installed zod
 * is 3.25.x, which ships the v4 API under the `zod/v4` subpath — so we import from
 * there, NOT the default `zod` (still the v3 API in 3.25.x). SeoSchema doubles as
 * the documented output contract exercised by seo.test.ts.
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
 * Lenient runtime shape-check for the model's JSON reply. Unlike SeoSchema it does
 * NOT cap length: Gemini's responseSchema `maxLength` is a soft nudge, so we enforce
 * length (fail-open) via sanitizeSeo's clamp rather than rejecting a slightly-long
 * reply and losing the day's Pin. This guarantees three present, non-empty strings.
 */
const SeoResponseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  board_suggestion: z.string().min(1),
})

/**
 * Gemini structured-output schema (Google's OpenAPI-subset dialect, NOT JSON
 * Schema). `type` uses the SDK's string enum values and `maxLength` is a STRING
 * per the SDK types. Fed to `config.responseSchema` so the model returns exactly
 * these three fields as parseable JSON. `propertyOrdering` pins field order for
 * stable, cache-friendly output.
 */
const SEO_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: {
      type: 'STRING',
      maxLength: String(TITLE_MAX),
      description: 'Catchy Pinterest pin title: a hook plus the primary keyword. Under 100 characters.',
    },
    description: {
      type: 'STRING',
      maxLength: String(DESCRIPTION_MAX),
      description:
        'Engaging description under 500 characters. Weave in 3–4 natural related search terms. ' +
        'Absolutely NO hashtags.',
    },
    board_suggestion: {
      type: 'STRING',
      maxLength: String(BOARD_MAX),
      description: 'A broad Pinterest board category, 2–4 words, e.g. "3D Printed Pooja Decor".',
    },
  },
  required: ['title', 'description', 'board_suggestion'],
  propertyOrdering: ['title', 'description', 'board_suggestion'],
}

/** The Gemini model used for SEO copy — cheap, fast, structured-output capable. */
const SEO_MODEL = 'gemini-2.5-flash'

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
 * Generates + validates SEO metadata for a product via Google Gemini.
 *
 * Uses gemini-2.5-flash with structured output (responseMimeType
 * 'application/json' + responseSchema). Thinking is explicitly DISABLED
 * (thinkingBudget: 0): 2.5-flash thinks by default and those tokens draw from
 * maxOutputTokens, which could starve the JSON and yield an empty reply — the
 * task is bounded copywriting where reasoning buys nothing. Non-streaming is
 * correct: the output is a few hundred tokens.
 *
 * @param product the catalog product to describe
 * @param apiKey  the Gemini (Google AI Studio) API key (from config)
 */
export async function generateSeo(product: Product, apiKey: string): Promise<SeoContent> {
  // Dynamic import keeps the ESM-only SDK out of Jest's CommonJS graph.
  const { GoogleGenAI } = await import('@google/genai')

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: SEO_MODEL,
    contents: buildSeoUserPrompt(product),
    config: {
      systemInstruction: SEO_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: SEO_RESPONSE_SCHEMA,
      maxOutputTokens: 1024,
      temperature: 0.7,
      // 2.5-flash thinks by default; disable so thinking can't consume the
      // output budget and return empty text (0 = DISABLED per the SDK).
      thinkingConfig: { thinkingBudget: 0 },
    },
  })

  const text = response.text
  if (!text || text.trim() === '') {
    throw new Error(`SEO generation returned no text for product ${product.id}.`)
  }

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error(`SEO generation returned non-JSON output for product ${product.id}: ${text}`)
  }

  const result = SeoResponseSchema.safeParse(raw)
  if (!result.success) {
    throw new Error(
      `SEO generation returned off-contract output for product ${product.id}: ${result.error.message}`,
    )
  }

  // sanitizeSeo strips hashtags AND clamps to the max lengths — the hard length
  // backstop now that decoding no longer guarantees it.
  return sanitizeSeo(result.data)
}
