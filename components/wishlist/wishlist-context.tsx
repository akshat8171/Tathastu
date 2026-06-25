'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

/**
 * Wishlist state, server-backed for authenticated users.
 *
 * Source of truth is the `wishlist_items` table, reached via /api/account/wishlist
 * (which scopes by the unified AppUser.id server-side). On mount we hydrate from
 * GET; toggles optimistically update local state then POST/DELETE.
 *
 * Guests (not logged in) get a 401 from the API. We treat that as "wishlist
 * unavailable": `isReady` stays true but `requiresAuth` flips true so the UI can
 * redirect the heart click to /login instead of silently failing.
 *
 * Mirrors the CartProvider pattern (see components/cart/cart-context.tsx) and is
 * mounted alongside it in app/layout.tsx.
 */

export interface WishlistContextType {
  /** Set of product slugs currently wishlisted. */
  ids: Set<string>
  isWishlisted: (productId: string) => boolean
  /** Optimistic toggle. Returns the new state (true = now wishlisted). */
  toggle: (productId: string) => Promise<boolean>
  count: number
  /** Hydration finished (GET resolved, success or 401). */
  isReady: boolean
  /** True when the API said the user is not authenticated. */
  requiresAuth: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [isReady, setIsReady] = useState(false)
  const [requiresAuth, setRequiresAuth] = useState(false)

  // Hydrate from the server once on mount.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/account/wishlist', { method: 'GET' })
        if (cancelled) return
        if (res.status === 401) {
          setRequiresAuth(true)
        } else if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (Array.isArray(data.productIds)) setIds(new Set<string>(data.productIds))
        }
      } catch {
        /* network error → leave empty, isReady still flips */
      } finally {
        if (!cancelled) setIsReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const isWishlisted = useCallback((productId: string) => ids.has(productId), [ids])

  const toggle = useCallback(
    async (productId: string): Promise<boolean> => {
      if (requiresAuth) return false // caller should redirect to /login

      const currentlyOn = ids.has(productId)
      const next = !currentlyOn

      // Optimistic update.
      setIds(prev => {
        const copy = new Set(prev)
        if (next) copy.add(productId)
        else copy.delete(productId)
        return copy
      })

      try {
        const res = await fetch('/api/account/wishlist', {
          method: next ? 'POST' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (res.status === 401) {
          setRequiresAuth(true)
          // revert
          setIds(prev => {
            const copy = new Set(prev)
            if (currentlyOn) copy.add(productId)
            else copy.delete(productId)
            return copy
          })
          return false
        }
        if (!res.ok) throw new Error('wishlist update failed')
      } catch {
        // Revert on failure.
        setIds(prev => {
          const copy = new Set(prev)
          if (currentlyOn) copy.add(productId)
          else copy.delete(productId)
          return copy
        })
        return currentlyOn
      }
      return next
    },
    [ids, requiresAuth]
  )

  return (
    <WishlistContext.Provider
      value={{ ids, isWishlisted, toggle, count: ids.size, isReady, requiresAuth }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
