import 'server-only'
import crypto from 'crypto'
import Razorpay from 'razorpay'

/**
 * Server-side Razorpay helpers.
 *
 * Secrets (RAZORPAY_KEY_SECRET) live only here and in API routes.
 * Never import this module from client components.
 */

const MIN_AMOUNT_PAISE = 100

export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)')
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export interface CreateRazorpayOrderInput {
  /** Amount in rupees (whole rupees from checkout). Converted to paise for Razorpay. */
  amountRupees: number
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export interface RazorpayOrderResult {
  id: string
  amount: number
  currency: string
  receipt: string | null
}

/**
 * Create a Razorpay order. Amount must be >= 100 paise (₹1).
 */
export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
): Promise<RazorpayOrderResult> {
  const amountPaise = Math.round(input.amountRupees * 100)
  if (!Number.isFinite(amountPaise) || amountPaise < MIN_AMOUNT_PAISE) {
    throw new Error(`amount must be at least ${MIN_AMOUNT_PAISE} paise`)
  }
  const razorpay = getRazorpayClient()
  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: input.currency || 'INR',
    receipt: input.receipt || `rcpt_${Date.now()}`,
    notes: input.notes || {},
  })
  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    receipt: order.receipt ?? null,
  }
}

/**
 * Verify Razorpay payment signature.
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET) → hex
 */
export function verifyRazorpayPaymentSignature(params: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    return false
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false
  }
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(razorpay_signature, 'utf8')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Verify Razorpay webhook signature (x-razorpay-signature over raw body).
 * Fail-closed: missing secret/signature → false.
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature) {
    return false
  }
  try {
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(signature, 'utf8')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Fetch a payment and confirm it is captured for the expected rupee total.
 * Used on the order-create money path as defence-in-depth after signature check.
 */
export async function confirmRazorpayPaymentAmount(
  paymentId: string,
  expectedTotalRupees: number
): Promise<{ ok: boolean; method?: string; amountPaise?: number }> {
  try {
    const razorpay = getRazorpayClient()
    const payment = await razorpay.payments.fetch(paymentId)
    const status = String(payment.status || '')
    const amountPaise = Number(payment.amount)
    const expectedPaise = Math.round(expectedTotalRupees * 100)
    const isCaptured = status === 'captured' || status === 'authorized'
    if (!isCaptured || amountPaise !== expectedPaise) {
      return { ok: false, method: payment.method as string | undefined, amountPaise }
    }
    return { ok: true, method: payment.method as string | undefined, amountPaise }
  } catch (error) {
    console.error('Razorpay payment fetch failed', { paymentId, error })
    return { ok: false }
  }
}

export { MIN_AMOUNT_PAISE }
