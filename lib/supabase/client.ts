import { createBrowserClient } from '@supabase/ssr'

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Browser client backed by cookies (not localStorage) via @supabase/ssr.
// This is what lets the server (createServerClient) read the same auth
// session: access + refresh tokens are stored in httpOnly cookies and
// rotated automatically by the middleware's getUser() call.
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)

// Database Types
export interface Customer {
  id: string
  email?: string
  name?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category: string
  price: number
  original_price?: number
  compare_price?: number
  discount_percentage?: number
  stock_quantity: number
  is_sold_out: boolean
  label_type?: 'trending' | 'editors-choice' | 'lightning-deal' | 'new'
  rating: number
  review_count: number
  care_guide?: string
  shipping_info?: string
  images: string[]
  second_image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'razorpay' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_id?: string
  payment_order_id?: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
  notes?: string
  tracking_number?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  product_variant?: string
  product_image?: string
  price: number
  original_price?: number
  quantity: number
  subtotal: number
  created_at: string
}

export interface CartItem {
  id: string
  session_id: string
  customer_id?: string
  product_id: string
  quantity: number
  variant?: string
  created_at: string
  updated_at: string
}

export interface PaymentLog {
  id: string
  order_id: string
  cashfree_order_id?: string
  cashfree_payment_id?: string
  amount: number
  currency: string
  payment_method?: string
  payment_status?: string
  response_data?: any
  error_message?: string
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  customer_id?: string
  rating: number
  title?: string
  comment?: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount_amount?: number
  usage_limit?: number
  usage_count: number
  valid_from: string
  valid_until?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
