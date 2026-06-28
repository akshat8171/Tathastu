'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCart } from '@/components/cart/cart-context'
import { useWishlist } from '@/components/wishlist/wishlist-context'
import { Badge } from '@/components/ui'
import { SearchOverlay } from '@/components/layout/search-overlay'

interface NavItem {
  href: string
  label: string
  badge?: 'new' | 'discount' | 'sale'
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/products?category=pooja-decor', label: 'Pooja & Decor' },
  { href: '/products?category=keyrings', label: 'Keyrings', badge: 'new' },
  { href: '/products?category=lamps', label: 'Home Decor' },
  { href: '/products?category=organizers', label: 'Workspace' },
  { href: '/products?category=gaming', label: 'Gaming' },
  { href: '/customize', label: 'Customise Now' },
  { href: '/blog', label: 'Blog' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('#mobile-menu') && !target.closest('#hamburger-btn')) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white border-b border-gray-100 transition-shadow duration-200 ${scrolled ? 'shadow-sm' : ''}`}
        data-testid="site-header"
      >
        <div className="container-page">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ──────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center font-display font-bold text-xl text-ink tracking-tight"
              aria-label="Tathastu Keepsakes — home"
            >
              Tathastu<span className="text-brand"> Keepsakes</span>
            </Link>

            {/* ── Desktop Nav ───────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-display font-medium text-ink hover:text-brand transition-colors rounded-md hover:bg-surface group"
                >
                  {item.label}
                  {item.badge && (
                    <Badge variant={item.badge} className="text-[10px] px-1.5 py-0">
                      NEW
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Right Icons ───────────────────────────────── */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-muted hover:text-brand transition-colors rounded-md hover:bg-surface"
                aria-label="Search products"
                data-testid="header-search-btn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Account */}
              <Link
                href="/account"
                className="p-2 text-muted hover:text-brand transition-colors rounded-md hover:bg-surface"
                aria-label="My account"
                data-testid="header-account-link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              {/* Wishlist — Link with live count badge */}
              <Link
                href="/wishlist"
                className="relative hidden sm:flex p-2 text-muted hover:text-brand transition-colors rounded-md hover:bg-surface"
                aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} saved item${wishlistCount !== 1 ? 's' : ''}` : ''}`}
                data-testid="header-wishlist-link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-display font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5 leading-none"
                    aria-hidden="true"
                    data-testid="wishlist-count-badge"
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-muted hover:text-brand transition-colors rounded-md hover:bg-surface"
                aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? 's' : ''}` : ''}`}
                data-testid="header-cart-link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-display font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5 leading-none"
                    aria-hidden="true"
                    data-testid="cart-count-badge"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Hamburger — mobile only */}
              <button
                id="hamburger-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-ink hover:text-brand transition-colors rounded-md hover:bg-surface"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                data-testid="hamburger-btn"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────── */}
        {mobileOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden border-t border-gray-100 bg-white"
            aria-label="Mobile navigation"
            data-testid="mobile-menu"
          >
            <ul className="container-page py-3 flex flex-col gap-0.5">
              {navItems.map((item) => (
                <li key={`mob-${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between px-3 py-3 text-sm font-display font-medium text-ink hover:text-brand hover:bg-surface rounded-md transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant={item.badge} className="text-[10px] px-1.5 py-0">
                        NEW
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}

              {/* Divider + extra mobile links */}
              <li>
                <hr className="my-2 border-gray-100" />
              </li>
              <li>
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-3 text-sm font-sans text-muted hover:text-brand hover:bg-surface rounded-md transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 px-3 py-3 text-sm font-sans text-muted hover:text-brand hover:bg-surface rounded-md transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="flex items-center gap-2 px-3 py-3 text-sm font-sans text-muted hover:text-brand hover:bg-surface rounded-md transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  Cart
                  {itemCount > 0 && (
                    <span className="ml-auto bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Search overlay — mounted outside header to avoid z-index issues */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
