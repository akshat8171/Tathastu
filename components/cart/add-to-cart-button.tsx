'use client'

import { useCart } from './cart-context'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * AddToCartButton — teal primary button.
 *
 * STABLE PROP CONTRACT (other builders import this component):
 *   product.id          string   — must match CartItem.id
 *   product.name        string
 *   product.variant?    string   — defaults to "Default"
 *   product.price       number   — unit price in ₹
 *   product.originalPrice number — compare-at price in ₹
 *   product.image       string   — primary image path
 *   className?          string   — extra Tailwind classes for the wrapper
 *   onAddSuccess?       () => void — called after item is added (250 ms after click)
 *   fullWidth?          boolean  — pass through to Button (default false)
 *   size?               'sm' | 'md' | 'lg'  — Button size (default 'md')
 *   label?              string   — override the default "Add to cart" label
 */
export interface AddToCartButtonProduct {
  id: string
  name: string
  variant?: string
  price: number
  originalPrice: number
  image: string
}

export interface AddToCartButtonProps {
  product: AddToCartButtonProduct
  className?: string
  onAddSuccess?: () => void
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  /** When true, button is disabled and shows the label as-is (for "Select options" state) */
  disabled?: boolean
  /** Optional custom text to carry into the cart item */
  customText?: string
  /** Optional selected options map to carry into the cart item */
  selectedOptions?: Record<string, string>
}

export function AddToCartButton({
  product,
  className = '',
  onAddSuccess,
  fullWidth = false,
  size = 'md',
  label = 'Add to cart',
  disabled = false,
  customText,
  selectedOptions,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    if (isAdding || disabled) return
    setIsAdding(true)

    addItem({
      id: product.id,
      name: product.name,
      variant: product.variant || 'Default',
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: 1,
      image: product.image,
      ...(customText ? { customText } : {}),
      ...(selectedOptions ? { selectedOptions } : {}),
    })

    setAdded(true)

    setTimeout(() => {
      setIsAdding(false)
      setAdded(false)
      onAddSuccess?.()
    }, 1200)
  }

  return (
    <Button
      variant="primary"
      size={size}
      fullWidth={fullWidth}
      disabled={isAdding || disabled}
      onClick={handleAddToCart}
      className={className}
      aria-label={added ? `${product.name} added to cart` : label}
    >
      {isAdding ? (
        <span className="flex items-center justify-center gap-2">
          {added ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Added ✓
            </>
          ) : (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Adding...
            </>
          )}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
            <path d="M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40Z" />
          </svg>
          {label}
        </span>
      )}
    </Button>
  )
}
