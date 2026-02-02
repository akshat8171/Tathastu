'use client'

import { useCart } from './cart-context'
import { useState } from 'react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    variant?: string
    price: number
    originalPrice: number
    image: string
  }
  className?: string
  onAddSuccess?: () => void
}

export function AddToCartButton({ 
  product, 
  className = '',
  onAddSuccess 
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    addItem({
      id: product.id,
      name: product.name,
      variant: product.variant || 'Default',
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: 1,
      image: product.image
    })

    // Optional: Show success animation
    setTimeout(() => {
      setIsAdding(false)
      onAddSuccess?.()
    }, 500)
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`
        relative overflow-hidden
        bg-[#8B7B6C] hover:bg-[#7a6b5d] 
        text-white font-semibold 
        px-6 py-3 rounded-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isAdding ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Adding...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256">
            <path d="M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40Z"></path>
          </svg>
          Add to Cart
        </span>
      )}
    </button>
  )
}
