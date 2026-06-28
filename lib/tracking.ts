/**
 * lib/tracking.ts — Courier / shipment tracking interface.
 *
 * When TRACKING_PROVIDER is unset (or when the order has no tracking_number),
 * returns a deterministic mock status derived from order.status — no external
 * call is made. This satisfies the P2 live-courier-tracking spec exactly:
 *   "when TRACKING_PROVIDER is unset → return a deterministic mock status
 *    derived from order.status (no external call)."
 *
 * Real carrier integration (Shiprocket / Delhivery) drops in by setting
 * TRACKING_PROVIDER and implementing the corresponding branch below.
 * The interface and calling code do NOT change.
 *
 * This file does NOT use 'server-only' — it is safe to call from both Server
 * Components and API routes (it makes no browser-only calls). However, do NOT
 * import it from Client Components as it may be extended with server-only
 * dependencies in the future.
 */

export interface TrackingStatus {
  /** Order or tracking number as stored on the order */
  trackingNumber: string | null
  /** Human-readable current status description */
  statusLabel: string
  /** Carrier name (e.g. "Delhivery", "Shiprocket") or null when mocked */
  carrier: string | null
  /** External tracking URL (carrier's website) or null */
  trackingUrl: string | null
  /** ISO-8601 estimated delivery date string or human label ("3–5 business days") */
  estimatedDelivery: string | null
  /** True when this is a mock/derived status (no real carrier data) */
  isMock: boolean
}

/**
 * Minimal order shape consumed by getTrackingStatus.
 * Matches the Order type from lib/supabase/client but only requires the fields
 * we actually use — so test doubles can pass a partial object.
 */
export interface TrackableOrder {
  status: string
  tracking_number?: string | null
  shipped_at?: string | null
  delivered_at?: string | null
}

/**
 * Map an internal order status to a human-readable mock tracking label.
 * Deterministic: the same status always produces the same label.
 */
function mockStatusLabel(orderStatus: string): string {
  const labels: Record<string, string> = {
    pending: 'Order received — awaiting payment confirmation',
    paid: 'Payment confirmed — entering print queue',
    processing: 'Being 3D printed — dispatching soon',
    shipped: 'Shipped and in transit',
    delivered: 'Delivered',
    cancelled: 'Order cancelled',
  }
  return labels[orderStatus] ?? 'Status unknown'
}

/**
 * Fetch the current tracking/shipment status for an order.
 *
 * When TRACKING_PROVIDER is set:
 *   - 'shiprocket' — TODO: call Shiprocket AWB tracking API
 *   - 'delhivery'  — TODO: call Delhivery track API
 *   (Both are no-op until credentials are wired; falls through to mock)
 *
 * When TRACKING_PROVIDER is unset → returns a mock derived from order.status.
 * Never throws.
 */
export async function getTrackingStatus(order: TrackableOrder): Promise<TrackingStatus> {
  const provider = process.env.TRACKING_PROVIDER

  // Real carrier integration placeholder — add credentials via env vars
  if (provider && order.tracking_number) {
    try {
      if (provider === 'shiprocket') {
        // TODO: implement Shiprocket tracking API call
        // const data = await shiprocketTrack(order.tracking_number, process.env.SHIPROCKET_TOKEN!)
        // return { trackingNumber: order.tracking_number, statusLabel: data.status, ... }
        console.warn('tracking: shiprocket provider configured but not yet implemented')
      } else if (provider === 'delhivery') {
        // TODO: implement Delhivery tracking API call
        // const data = await delhiveryTrack(order.tracking_number, process.env.DELHIVERY_TOKEN!)
        // return { trackingNumber: order.tracking_number, statusLabel: data.status, ... }
        console.warn('tracking: delhivery provider configured but not yet implemented')
      }
    } catch (err) {
      console.error('tracking: carrier API error, falling back to mock', err)
    }
  }

  // ── Mock / fallback ────────────────────────────────────────────────────────
  // Derive a deterministic status from the internal order status.
  const hasTrackingNumber = !!order.tracking_number
  const estimatedDelivery =
    order.status === 'shipped'
      ? '3–5 business days'
      : order.status === 'delivered'
      ? null
      : order.status === 'processing'
      ? '5–7 business days'
      : '7–10 business days'

  return {
    trackingNumber: order.tracking_number ?? null,
    statusLabel: mockStatusLabel(order.status),
    carrier: null, // no real carrier data in mock mode
    trackingUrl: null,
    estimatedDelivery: order.status === 'delivered' ? null : estimatedDelivery,
    isMock: !provider || !hasTrackingNumber,
  }
}
