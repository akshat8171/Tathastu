/**
 * run.ts — Pinterest autopilot orchestrator. One invocation = one daily Pin.
 *
 * Flow (see design spec §3):
 *   1. load + validate config
 *   2. read posted-log
 *   3. RANK products least-recently-posted first
 *   4. mint a fresh Pinterest access token (live only; grant per config.authMode)
 *   5. walk candidates in rank order until one publishes:
 *        a. build the public image URL
 *        b. precheck the image is reachable  (cheap, auth-free → do this BEFORE
 *           the paid Gemini call so a dead-image product is skipped for free)
 *        c. generate SEO metadata (Gemini)
 *        d. resolve (get-or-create) the target board
 *        e. publish the Pin
 *      A candidate that throws at any step is logged and SKIPPED — the next
 *      candidate is tried. This is what keeps the agent hands-off: one poison
 *      product (e.g. a 404 image) can never wedge the whole rotation.
 *   6. append the successful post to the posted-log (committed back by CI)
 *
 * Flags:
 *   --dry-run   Do everything EXCEPT mint a token, publish, and append to the
 *               log. Prints the assembled payload for the first viable product.
 *
 * Exit code is non-zero on any hard failure so GitHub Actions shows a red X.
 * State is only mutated after a confirmed publish, so a failure never corrupts
 * the log — the next run simply retries.
 */

import { loadConfig } from './config'
import { loadProducts, rankProducts, buildPublicImageUrl } from './products'
import { generateSeo } from './seo'
import { mintAccessToken } from './auth'
import { assertImageReachable, resolveBoard, publishPin } from './pinterest'
import { readLog, recordResult } from './state'
import type { PostRecord } from './types'

/**
 * How many ranked candidates to try before giving up in a single run. Bounds
 * wasted work on a systemic outage (so we fail loudly rather than burning the
 * whole catalog), while still letting the run route around a few bad products.
 */
export const MAX_CANDIDATE_ATTEMPTS = 5

function log(step: string, msg: string): void {
  // Structured, greppable log lines in the Actions output.
  console.log(`[pinterest-autopilot] ${step}: ${msg}`)
}

/**
 * Injectable dependencies — real implementations by default, overridable in
 * tests so the orchestration (candidate-skipping, record-only-after-publish)
 * can be exercised without network, SDK, or filesystem.
 */
export interface RunDeps {
  loadConfig: typeof loadConfig
  loadProducts: typeof loadProducts
  readLog: typeof readLog
  rankProducts: typeof rankProducts
  buildPublicImageUrl: typeof buildPublicImageUrl
  generateSeo: typeof generateSeo
  mintAccessToken: typeof mintAccessToken
  assertImageReachable: typeof assertImageReachable
  resolveBoard: typeof resolveBoard
  publishPin: typeof publishPin
  recordResult: typeof recordResult
}

export const DEFAULT_DEPS: RunDeps = {
  loadConfig,
  loadProducts,
  readLog,
  rankProducts,
  buildPublicImageUrl,
  generateSeo,
  mintAccessToken,
  assertImageReachable,
  resolveBoard,
  publishPin,
  recordResult,
}

export async function main(
  argv: string[] = process.argv.slice(2),
  deps: RunDeps = DEFAULT_DEPS,
): Promise<void> {
  const dryRun = argv.includes('--dry-run')

  // 1. Config
  const config = deps.loadConfig()
  log(
    'config',
    `loaded (origin=${config.siteOrigin}, auth=${config.authMode}${dryRun ? ', DRY RUN' : ''})`,
  )

  // 2 + 3. History → ranked candidates
  const products = deps.loadProducts()
  const postedLog = await deps.readLog()
  log('catalog', `${products.length} products, ${postedLog.posts.length} prior posts`)
  const ranked = deps.rankProducts(products, postedLog)
  if (ranked.length === 0) {
    throw new Error('No publishable products in the catalog (all missing id/name/image?).')
  }

  // 4. Fresh access token (live only; grant type per config.authMode).
  let token = ''
  if (!dryRun) {
    token = await deps.mintAccessToken(config)
    log('auth', `minted fresh access token via ${config.authMode}`)
  }

  // 5. Walk candidates until one publishes; skip any that fails.
  const attempts = Math.min(ranked.length, MAX_CANDIDATE_ATTEMPTS)
  const failures: string[] = []

  for (let i = 0; i < attempts; i++) {
    const product = ranked[i]!
    // Tracks whether we've crossed the point of no return: a live Pin now exists
    // on Pinterest. Once true, a later failure must NOT fall through to another
    // candidate — doing so would publish a duplicate. See the catch below.
    let published = false
    try {
      const imageUrl = deps.buildPublicImageUrl(product.images[0]!, config.siteOrigin)
      const link = `${config.siteOrigin}/products/${product.id}`

      // (b) Auth-free reachability precheck BEFORE the paid Gemini call.
      await deps.assertImageReachable(imageUrl)
      log('image', `reachable: ${imageUrl}`)

      // (c) SEO
      const seo = await deps.generateSeo(product, config.geminiApiKey)
      log('seo', `title="${seo.title}" | board="${seo.board_suggestion}"`)

      if (dryRun) {
        log('dry-run', `would publish "${product.name}" (${product.id}). Assembled payload:`)
        console.log(
          JSON.stringify(
            { board_suggestion: seo.board_suggestion, title: seo.title, description: seo.description, link, imageUrl },
            null,
            2,
          ),
        )
        return
      }

      // (d) Board
      const boardId = await deps.resolveBoard({ token, name: seo.board_suggestion })
      log('board', `resolved "${seo.board_suggestion}" → ${boardId}`)

      // (e) Publish — the point of no return. After this resolves, a live Pin
      // exists; we must never publish another this run.
      const pin = await deps.publishPin({ token, boardId, seo, link, imageUrl, altText: product.name })
      published = true
      log('publish', `created pin ${pin.id}`)

      // 6. Record (only after a confirmed publish).
      const record: PostRecord = {
        productId: product.id,
        pinId: pin.id,
        boardId,
        boardName: seo.board_suggestion,
        title: seo.title,
        link,
        postedAt: new Date().toISOString(),
      }
      await deps.recordResult(record)
      log('state', `recorded post for ${product.id}`)
      return // success — done for the day
    } catch (err) {
      const msg = (err as Error).message
      if (published) {
        // The Pin was created but a later step (recording its state) threw.
        // Skipping to another candidate would double-post, so fail loudly instead
        // and let the operator reconcile the log — the Pin already exists on
        // Pinterest, and a red build is far safer than a silent duplicate tomorrow.
        throw new Error(
          `Pin published for "${product.id}" but recording its state failed — ` +
            `posted-log must be reconciled to avoid a duplicate on the next run. Cause: ${msg}`,
        )
      }
      failures.push(`${product.id}: ${msg}`)
      log('skip', `candidate "${product.name}" (${product.id}) failed: ${msg} — trying next`)
    }
  }

  throw new Error(
    `No Pin published: all ${attempts} candidate product(s) failed. Details — ${failures.join(' | ')}`,
  )
}

// Execute only when run directly (tsx scripts/pinterest/run.ts), not when imported.
// require.main === module is the CommonJS entry check; tsx shims it for ESM.
if (typeof require !== 'undefined' && require.main === module) {
  main().catch((err: unknown) => {
    console.error(`[pinterest-autopilot] FATAL: ${(err as Error).message}`)
    process.exit(1)
  })
}
