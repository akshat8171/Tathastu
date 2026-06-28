/**
 * app/not-found.tsx — Custom 404 error page
 *
 * Displayed when a page is not found. Provides helpful navigation
 * and maintains brand consistency.
 */

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-lg">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-[120px] font-bold text-gray-200 leading-none">
            404
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-muted mb-8">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-dark transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Homepage
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-brand border-2 border-brand font-semibold hover:bg-brand hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Browse Products
          </Link>
        </div>

        {/* Popular links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-muted mb-4">
            Popular pages you might be looking for:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/custom-3d-printing"
              className="text-sm text-brand hover:underline"
            >
              Custom 3D Printing
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/blog"
              className="text-sm text-brand hover:underline"
            >
              Blog
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/contact"
              className="text-sm text-brand hover:underline"
            >
              Contact Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/faqs"
              className="text-sm text-brand hover:underline"
            >
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
