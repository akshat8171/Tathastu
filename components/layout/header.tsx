'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './header.module.css'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
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
            <button
              className={styles.iconButton}
              aria-label="Search"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Center: Logo */}
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoContainer}>
              <Image
                src="/images/logo/Tathastu Logo.png"
                alt="Tathastu Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Right: Cart */}
          <div className={styles.rightSection}>
            <Link
              href="/cart"
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
                0
              </span>
            </Link>
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
    </header>
  )
}
