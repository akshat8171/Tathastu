'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

/**
 * Shared checkout state across the two sibling columns of the checkout page
 * (CheckoutForm on the left, OrderSummary on the right).
 *
 * The coupon UI lives in OrderSummary, but the order is *placed* from
 * CheckoutForm (and the Razorpay charge amount is computed there too). Without
 * a shared store, a coupon applied in the summary would never reach the order
 * POST nor the payment amount — the user would see a discount but be charged
 * full price. This provider is the single source of truth for the applied
 * coupon so the displayed discount is always the one actually charged and
 * recorded.
 *
 * The server still re-validates the coupon at write time (/api/orders), so this
 * is purely a UI-consistency mechanism — never the authority on the discount.
 */
export interface AppliedCoupon {
  /** Normalised coupon code (as returned by the validate endpoint). */
  code: string
  /** Server-computed discount in whole rupees. */
  discount: number
}

interface CheckoutContextType {
  /** The currently applied coupon, or null if none is applied. */
  appliedCoupon: AppliedCoupon | null
  /** Apply a coupon (pass null to clear). */
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  return (
    <CheckoutContext.Provider value={{ appliedCoupon, setAppliedCoupon }}>
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}
