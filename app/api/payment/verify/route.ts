import { NextRequest, NextResponse } from 'next/server'
import { fetchCashfreeOrder, isCashfreeOrderPaid } from '@/lib/cashfree-server'

export const dynamic = 'force-dynamic'

/**
 * Confirm a Cashfree payment by asking Cashfree for the authoritative order
 * status.
 *
 * Unlike Razorpay, the browser never receives a signature to forward — trust
 * comes ONLY from a server→Cashfree status lookup. This endpoint gives the
 * checkout UI a fast yes/no after the modal closes; the real money path
 * (/api/orders) independently re-fetches the same status before marking paid,
 * so a spoofed call here can never create a paid order.
 */
export async function POST(request: NextRequest) {
  try {
    const { cashfree_order_id } = await request.json()

    if (!cashfree_order_id || typeof cashfree_order_id !== 'string') {
      return NextResponse.json({ error: 'Missing cashfree_order_id' }, { status: 400 })
    }

    const order = await fetchCashfreeOrder(cashfree_order_id)
    const paid = isCashfreeOrderPaid(order.order_status)

    return NextResponse.json({
      success: paid,
      verified: paid,
      orderId: order.order_id,
      orderStatus: order.order_status,
    })
  } catch (error: any) {
    console.error('Cashfree verify error:', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}
