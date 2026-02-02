// Cashfree Payment Gateway Integration
// Documentation: https://docs.cashfree.com/docs/

export interface CashfreeConfig {
  appId: string
  env: 'TEST' | 'PROD'
}

export interface PaymentOrder {
  orderId: string
  orderAmount: number
  orderCurrency: string
  customerName: string
  customerEmail: string
  customerPhone: string
  returnUrl: string
  notifyUrl?: string
}

export interface CashfreeOrderResponse {
  status: string
  message: string
  order_id: string
  order_token: string
  order_status: string
}

/**
 * Get Cashfree configuration
 */
export function getCashfreeConfig(): CashfreeConfig {
  const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID
  const env = (process.env.NEXT_PUBLIC_CASHFREE_ENV || 'TEST') as 'TEST' | 'PROD'

  if (!appId) {
    throw new Error('Cashfree App ID is not configured. Please set NEXT_PUBLIC_CASHFREE_APP_ID in .env.local')
  }

  return {
    appId,
    env,
  }
}

/**
 * Generate unique order ID
 */
export function generateOrderId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `ORDER_${timestamp}_${random}`
}

/**
 * Format amount for Cashfree (must be a number with 2 decimal places)
 */
export function formatAmount(amount: number): number {
  return Number(amount.toFixed(2))
}

/**
 * Load Cashfree SDK script
 */
export function loadCashfreeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && (window as any).Cashfree) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'))
    document.head.appendChild(script)
  })
}

/**
 * Initialize Cashfree payment
 */
export async function initializeCashfreePayment(orderToken: string): Promise<any> {
  try {
    await loadCashfreeSDK()
    
    const config = getCashfreeConfig()
    const cashfree = (window as any).Cashfree({
      mode: config.env,
    })

    return cashfree
  } catch (error) {
    console.error('Error initializing Cashfree:', error)
    throw error
  }
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
