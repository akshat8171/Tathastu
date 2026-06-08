import Link from 'next/link'

export default function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-display font-bold mb-4">Order Confirmed!</h1>
      <p className="text-gray-400 mb-2">Thank you for your order</p>
      <p className="text-sm text-gray-500 mb-8">Order #{params.orderNumber}</p>
      <div className="card p-6 mb-8 text-left">
        <h2 className="font-semibold mb-2">What happens next?</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✅ Payment confirmed</li>
          <li>🖨️ Your order enters the print queue</li>
          <li>📦 We&apos;ll ship within 3-5 business days</li>
          <li>📱 Track updates via WhatsApp</li>
        </ul>
      </div>
      <div className="flex gap-4 justify-center">
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
        <Link href="/account/orders" className="btn-secondary">View Orders</Link>
      </div>
    </div>
  )
}
