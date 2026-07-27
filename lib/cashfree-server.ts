import 'server-only'
import crypto from 'crypto'

/**
 * Server-side Cashfree Payment Gateway client (API version 2023-08-01).
 *
 * We call Cashfree's REST API directly with fetch rather than the SDK: it keeps
 * the money path transparent, avoids SDK-version drift, and works cleanly in the
 * Next.js edge/node runtime. Secrets (x-client-secret) are read from env here
 * and MUST never reach the browser.
 */

const API_VERSION = '2023-08-01'

function baseUrl(): string {
  return process.env.CASHFREE_MODE === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg'
}

function authHeaders(): Record<string, string> {
  const clientId = process.env.CASHFREE_APP_ID
  const clientSecret = process.env.CASHFREE_SECRET_KEY
  if (!clientId || !clientSecret) {
    throw new Error('Cashfree credentials are not configured (CASHFREE_APP_ID / CASHFREE_SECRET_KEY)')
  }
  return {
    'Content-Type': 'application/json',
    'x-api-version': API_VERSION,
    'x-client-id': clientId,
    'x-client-secret': clientSecret,
  }
}

export interface CreateCashfreeOrderInput {
  orderId: string
  amount: number
  currency?: string
  customer: { id: string; name?: string; email?: string; phone: string }
  notifyUrl?: string
  returnUrl?: string
}

export interface CashfreeOrder {
  order_id: string
  order_amount: number
  order_currency: string
  order_status: string // 'ACTIVE' | 'PAID' | 'EXPIRED' | 'TERMINATED' | ...
  payment_session_id?: string
}

export interface CashfreeOrderPayment {
  cf_payment_id: string | number
  payment_status: string // 'SUCCESS' | 'FAILED' | 'PENDING' | ...
  payment_amount: number
  payment_group?: string
  payment_method?: unknown
}

/**
 * Create a Cashfree order and get back a payment_session_id for the browser SDK.
 * Amount must be a number with (at most) 2 decimals; we send rupees directly
 * (Cashfree expects rupees, NOT paise — the opposite of Razorpay).
 */
export async function createCashfreeOrder(input: CreateCashfreeOrderInput): Promise<CashfreeOrder> {
  const res = await fetch(`${baseUrl()}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: Number(input.amount.toFixed(2)),
      order_currency: input.currency || 'INR',
      customer_details: {
        customer_id: input.customer.id,
        customer_name: input.customer.name || undefined,
        customer_email: input.customer.email || undefined,
        customer_phone: input.customer.phone,
      },
      order_meta: {
        notify_url: input.notifyUrl,
        return_url: input.returnUrl,
      },
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || `Cashfree create order failed (${res.status})`)
  }
  return data as CashfreeOrder
}

/** Fetch an order (authoritative status/amount) by our order id. */
export async function fetchCashfreeOrder(orderId: string): Promise<CashfreeOrder> {
  const res = await fetch(`${baseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || `Cashfree fetch order failed (${res.status})`)
  }
  return data as CashfreeOrder
}

/** Fetch the payment attempts for an order (to recover the cf_payment_id). */
export async function fetchCashfreeOrderPayments(orderId: string): Promise<CashfreeOrderPayment[]> {
  const res = await fetch(`${baseUrl()}/orders/${encodeURIComponent(orderId)}/payments`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || `Cashfree fetch payments failed (${res.status})`)
  }
  return Array.isArray(data) ? (data as CashfreeOrderPayment[]) : []
}

/**
 * Whether a Cashfree ORDER status counts as a completed sale.
 *
 * BUSINESS DECISION: we only treat a fully-captured 'PAID' order as paid.
 * 'ACTIVE' (awaiting payment), 'EXPIRED', and 'TERMINATED' are NOT paid.
 * Partial payments are not accepted for this store. If you later enable
 * partial/authorize-capture flows, widen this predicate deliberately.
 */
export function isCashfreeOrderPaid(orderStatus: string | undefined): boolean {
  return orderStatus === 'PAID'
}

/** Whether an individual PAYMENT attempt succeeded. */
export function isCashfreePaymentSuccess(paymentStatus: string | undefined): boolean {
  return paymentStatus === 'SUCCESS'
}

/**
 * Verify a Cashfree webhook signature.
 *
 * Cashfree signs `x-webhook-timestamp + rawBody` with HMAC-SHA256 keyed on the
 * secret, base64-encoded, delivered in `x-webhook-signature`. We recompute and
 * compare in constant time. The secret is the PG secret key by default; a
 * dedicated CASHFREE_WEBHOOK_SECRET override is honoured if set.
 *
 * Fail-closed: any missing input or mismatch returns false (never throws).
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null
): boolean {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY
  if (!secret || !timestamp || !signature) {
    return false
  }
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}${rawBody}`)
      .digest('base64')
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(signature, 'utf8')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}
