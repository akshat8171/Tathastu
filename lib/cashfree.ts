/**
 * Client-safe Cashfree helpers.
 *
 * This module is imported by the checkout UI, so it must NEVER reference secrets
 * (x-client-secret lives only in lib/cashfree-server.ts + API routes). It only
 * loads the browser SDK and opens the hosted checkout for a payment_session_id
 * that the server already minted.
 */

/** Minimal proof handed back to the order-create call after a Cashfree payment. */
export interface CashfreePaymentResult {
  /** The Cashfree order id we generated and passed to /orders. */
  cashfree_order_id: string
}

/** Options for opening the Cashfree hosted checkout modal. */
export interface CashfreeCheckoutOptions {
  paymentSessionId: string
  onClose: () => void
  onError: (error: unknown) => void
}

/**
 * Browser SDK mode. Cashfree's JS SDK takes 'sandbox' | 'production'. We read a
 * PUBLIC env var (safe — it's not a secret) and default to 'sandbox' so a
 * misconfigured deploy can never accidentally hit production with test creds.
 */
function cashfreeMode(): 'sandbox' | 'production' {
  return process.env.NEXT_PUBLIC_CASHFREE_MODE === 'production' ? 'production' : 'sandbox'
}

/**
 * Mock-payment mode — for local end-to-end testing without real Cashfree keys.
 *
 * Enabled ONLY when BOTH are true:
 *   1. NEXT_PUBLIC_MOCK_PAYMENT === 'true'  (opt-in flag)
 *   2. NODE_ENV !== 'production'             (hard safety gate)
 *
 * `next dev` runs with NODE_ENV='development', so mock mode works locally.
 * Every Vercel build (preview AND production) compiles with NODE_ENV='production',
 * so mock mode can NEVER activate in a deployed build — even if the flag is set
 * in the dashboard by mistake. Real payments stay real.
 *
 * NEXT_PUBLIC_ vars are inlined at build time, so this resolves to a constant
 * `false` in production bundles and the mock branch is dead-code-eliminated.
 */
export const isMockPaymentEnabled =
  process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true' &&
  process.env.NODE_ENV !== 'production'

/**
 * Fabricate a synthetic Cashfree order reference for mock mode.
 *
 * Clearly prefixed `mock_` so it's obvious in the DB and can be filtered later.
 * In /api/orders the server tries to confirm this id against Cashfree, the
 * lookup fails (no such order), and the order is correctly left 'pending' — so
 * mock mode exercises the create→confirmation flow without ever marking paid.
 */
export function createMockCashfreeResult(): CashfreePaymentResult {
  return { cashfree_order_id: `mock_order_${Date.now()}` }
}

/**
 * Load the Cashfree JS SDK v3. To stay PCI-compliant, Cashfree requires the
 * script be loaded directly from their CDN (never bundled or self-hosted).
 */
export function loadCashfreeScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }
    if ((window as any).Cashfree) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Open the Cashfree hosted checkout as a modal overlay.
 *
 * Unlike Razorpay, Cashfree does NOT hand the browser a signature to forward.
 * The modal promise resolving only means "the modal is done" — it is NOT proof
 * of payment. Authority comes from the server re-fetching the order status
 * (see /api/payment/verify and /api/orders). So `onClose` fires when the modal
 * completes and the caller MUST then verify server-side.
 */
export async function openCashfreeCheckout(options: CashfreeCheckoutOptions): Promise<void> {
  const cashfree = (window as any).Cashfree({ mode: cashfreeMode() })
  try {
    const result = await cashfree.checkout({
      paymentSessionId: options.paymentSessionId,
      redirectTarget: '_modal',
    })
    if (result && result.error) {
      options.onError(result.error)
      return
    }
    // Modal finished (paid, pending, or user-dismissed) — caller verifies status.
    options.onClose()
  } catch (err) {
    options.onError(err)
  }
}
