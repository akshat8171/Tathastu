'use client'

/**
 * Client wrapper for /custom-3d-printing.
 *
 * Re-uses the same form and UI from /customize, routed through a thin
 * server page so Next.js can inject static metadata for the alias route.
 * The customize page itself reads ?type= from useSearchParams so deep-links
 * like /custom-3d-printing?type=portrait work correctly.
 */

// We directly re-export the customize page default export so the two routes
// share identical UI — no duplication, no separate component tree.
export { default } from '@/app/customize/page'
