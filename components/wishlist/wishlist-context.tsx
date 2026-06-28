'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

/**
 * Wishlist state with guest localStorage persistence.
 *
 * Source of truth for authenticated users is the `wishlist_items` table, reached
 * via /api/account/wishlist (which scopes by the unified AppUser.id server-side).
 * On mount we hydrate from GET; toggles optimistically update local state then
 * POST/DELETE.
 *
 * GUEST SUPPORT (P2):
 * When the API returns 401, we fall back to a localStorage-backed guest wishlist
 * (key: "tathastu-wishlist-guest"). On the next sign-in the caller can merge by
 * reading the guest ids and re-toggling them — the merge itself is future work but
 * the storage layer is ready.
 *
 * Mirrors the CartProvider pattern (see components/cart/cart-context.tsx) and is
 * mounted alongside it in app/layout.tsx.
 */

const GUEST_WISHLIST_KEY = 'tathastu-wishlist-guest'

function loadGuestWishlist(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(GUEST_WISHLIST_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return new Set<string>(parsed)
  } catch {
    // corrupted storage — reset
    window.localStorage.removeItem(GUEST_WISHLIST_KEY)
  }
  return new Set()
}

function saveGuestWishlist(ids: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    /* storage full / private-mode — silent */
  }
}

export interface WishlistContextType {
  /** Set of product slugs currently wishlisted. */
  ids: Set<string>
  isWishlisted: (productId: string) => boolean
  /** Optimistic toggle. Returns the new state (true = now wishlisted). */
  toggle: (productId: string) => Promise<boolean>
  count: number
  /** Hydration finished (GET resolved, success or 401). */
  isReady: boolean
  /** True when the API said the user is not authenticated (guest mode). */
  requiresAuth: boolean
  /**
   * Guest-wishlist product ids (only populated for guests). Callers can use
   * this to merge into the server wishlist after sign-in.
   */
  guestIds: Set<string>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [isReady, setIsReady] = useState(false)
  const [requiresAuth, setRequiresAuth] = useState(false)
  // guestIds is the localStorage-backed set for unauthenticated users
  const [guestIds, setGuestIds] = useState<Set<string>>(new Set())

  // Hydrate from the server once on mount.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/account/wishlist', { method: 'GET' })
        if (cancelled) return
        if (res.status === 401) {
          // Guest — load from localStorage
          setRequiresAuth(true)
          const localIds = loadGuestWishlist()
          setGuestIds(localIds)
          setIds(new Set(localIds)) // guest wishlist is the active set
        } else if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (Array.isArray(data.productIds)) {
            const serverIds = new Set<string>(data.productIds)
            setIds(serverIds)
          }
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
      const currentlyOn = ids.has(productId)
      const next = !currentlyOn

      // Optimistic update.
      setIds(prev => {
        const copy = new Set(prev)
        if (next) copy.add(productId)
        else copy.delete(productId)
        return copy
      })

      // Guest: persist to localStorage and return immediately.
      if (requiresAuth) {
        setGuestIds(prev => {
          const copy = new Set(prev)
          if (next) copy.add(productId)
          else copy.delete(productId)
          saveGuestWishlist(copy)
          return copy
        })
        return next
      }

      // Authenticated: sync to server.
      try {
        const res = await fetch('/api/account/wishlist', {
          method: next ? 'POST' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (res.status === 401) {
          setRequiresAuth(true)
          // revert server state, fall back to local
          setIds(prev => {
            const copy = new Set(prev)
            if (currentlyOn) copy.add(productId)
            else copy.delete(productId)
            return copy
          })
          return currentlyOn
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
      value={{ ids, isWishlisted, toggle, count: ids.size, isReady, requiresAuth, guestIds }}
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
