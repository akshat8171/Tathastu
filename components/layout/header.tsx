'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './header.module.css'
import { CartSidebar } from '@/components/cart/cart-sidebar'
import { useCart } from '@/components/cart/cart-context'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { itemCount } = useCart()

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen)
  }

  function toggleCart() {
    setIsCartOpen(!isCartOpen)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Critical inline CSS for logo - prevents layout shift during initial render */
        header a[href="/"] > div > div:last-child {
          position: relative !important;
          width: 200px !important;
          height: 36px !important;
          max-width: 200px !important;
          max-height: 36px !important;
          overflow: hidden !important;
          flex-shrink: 0 !important;
        }
        header a[href="/"] > div > div:last-child img {
          max-width: 100% !important;
          max-height: 100% !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          display: block !important;
        }
        @media (max-width: 640px) {
          header a[href="/"] > div > div:last-child {
            width: 150px !important;
            height: 27px !important;
            max-width: 150px !important;
            max-height: 27px !important;
          }
        }
      `}} />
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
          {/* Left: Menu & Search */}
          <div className={styles.leftSection}>
            <button
              onClick={toggleMenu}
              className={styles.iconButton}
              aria-label="Toggle menu"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Center: Logo */}
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoContainer}>
              {/* <div className={styles.logoWrapper}>
                <Image
                  src="/images/logo/Layerix.svg"
                  alt="LayeriX Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div> */}
              <div 
                className={styles.logoWrapper}
                style={{
                  position: 'relative',
                  width: '200px',
                  height: '36px',
                  maxWidth: '200px',
                  maxHeight: '36px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/images/logo/layerix_text.svg"
                  alt="LayeriX Logo with Text"
                  className={styles.logoImage}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </Link>

          {/* Right: Cart */}
          <div className={styles.rightSection}>
            <button
              onClick={toggleCart}
              className={styles.cartLink}
              aria-label="Shopping cart"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className={styles.cartBadge}>
                {itemCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className={styles.mobileMenu}>
          <div className={styles.mobileMenuContent}>
            <Link
              href="/products"
              className={styles.mobileMenuLink}
            >
              Products
            </Link>
            <Link
              href="/watch-shop"
              className={styles.mobileMenuLink}
            >
              Watch & Shop
            </Link>
            <Link
              href="/about"
              className={styles.mobileMenuLink}
            >
              About
            </Link>
          </div>
        </nav>
      )}
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </header>
    </>
  )
}
