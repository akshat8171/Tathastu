'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  variant: string
  price: number
  originalPrice: number
  quantity: number
  image: string
  /** Optional: user-entered custom text (for personalised products) */
  customText?: string
  /** Optional: structured option selections, e.g. { Color: 'Red', Size: 'M' } */
  selectedOptions?: Record<string, string>
}

export interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('tathastu-cart')
    if (saved) {
      try { setItems(JSON.parse(saved)) } catch {}
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('tathastu-cart', JSON.stringify(items))
    }
  }, [items, loaded])

  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      // Two items are "the same line" only if id + variant + customText + selectedOptions all match
      function optKey(opts?: Record<string, string>): string {
        if (!opts || Object.keys(opts).length === 0) return ''
        return JSON.stringify(Object.keys(opts).sort().reduce<Record<string, string>>((acc, k) => {
          acc[k] = opts[k]
          return acc
        }, {}))
      }
      function isSameLine(i: CartItem): boolean {
        return (
          i.id === item.id &&
          i.variant === item.variant &&
          (i.customText ?? '') === (item.customText ?? '') &&
          optKey(i.selectedOptions) === optKey(item.selectedOptions)
        )
      }
      const existingItem = currentItems.find(isSameLine)
      if (existingItem) {
        return currentItems.map(i => isSameLine(i) ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...currentItems, item]
    })
  }

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
