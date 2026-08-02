/**
 * Client-safe Razorpay helpers.
 *
 * This module is imported by the checkout UI, so it must NEVER reference
 * RAZORPAY_KEY_SECRET. Only NEXT_PUBLIC_RAZORPAY_KEY_ID is used here.
 */

export interface RazorpayPaymentResult {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface OpenRazorpayCheckoutOptions {
  orderId: string
  /** Amount in paise (as returned by create-order). */
  amount: number
  currency?: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  onSuccess: (response: RazorpayPaymentResult) => void
  onDismiss?: () => void
  onError: (error: unknown) => void
}

/**
 * Mock-payment mode — local E2E without real Razorpay keys.
 * Enabled only when NEXT_PUBLIC_MOCK_PAYMENT === 'true' AND not production.
 */
export const isMockPaymentEnabled =
  process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true' && process.env.NODE_ENV !== 'production'

export function createMockRazorpayResult(): RazorpayPaymentResult {
  const ts = Date.now()
  return {
    razorpay_order_id: `order_mock_${ts}`,
    razorpay_payment_id: `pay_mock_${ts}`,
    razorpay_signature: `mock_sig_${ts}`,
  }
}

/** Load checkout.js from Razorpay CDN (required for PCI compliance). */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }
    if ((window as Window & { Razorpay?: unknown }).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Open Razorpay Standard Checkout modal for an existing order_id.
 */
export function openRazorpayCheckout(options: OpenRazorpayCheckoutOptions): void {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  if (!key) {
    options.onError(new Error('Razorpay key is not configured'))
    return
  }

  type RazorpayConstructor = new (opts: Record<string, unknown>) => {
    open: () => void
    on: (event: string, handler: (response: unknown) => void) => void
  }

  const RazorpayCtor = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay
  if (!RazorpayCtor) {
    options.onError(new Error('Razorpay SDK not loaded'))
    return
  }

  const rzp = new RazorpayCtor({
    key,
    amount: options.amount,
    currency: options.currency || 'INR',
    name: 'Tathastu Keepsakes',
    description: 'Order payment',
    order_id: options.orderId,
    prefill: {
      name: options.customerName,
      email: options.customerEmail || '',
      contact: options.customerPhone,
    },
    theme: { color: '#C45C26' },
    handler: (response: RazorpayPaymentResult) => {
      options.onSuccess(response)
    },
    modal: {
      ondismiss: () => {
        options.onDismiss?.()
      },
    },
  })

  rzp.on('payment.failed', (response: unknown) => {
    options.onError(response)
  })

  rzp.open()
}
