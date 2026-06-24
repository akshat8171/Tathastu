export interface RazorpayOptions {
  orderId: string
  amount: number
  customerName: string
  customerEmail?: string
  customerPhone: string
  onSuccess: (response: RazorpayResponse) => void
  onError: (error: any) => void
}

export interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export function openRazorpayCheckout(options: RazorpayOptions) {
  const rzp = new (window as any).Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: options.amount,
    currency: 'INR',
    name: 'Tathastu',
    description: '3D Printed Goods',
    order_id: options.orderId,
    prefill: {
      name: options.customerName,
      email: options.customerEmail || '',
      contact: options.customerPhone,
    },
    theme: {
      color: '#7C3AED',
    },
    handler: options.onSuccess,
  })

  rzp.on('payment.failed', options.onError)
  rzp.open()
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if ((window as any).Razorpay) {
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
