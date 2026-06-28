/**
 * app/blog/page.tsx — Blog listing page (server component).
 *
 * Displays all blog posts in a responsive grid with SEO metadata
 * targeting "3D printing blog India" and "Tathastu Keepsakes blog".
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/lib/site'
import { blogPosts, type BlogCategory } from '@/lib/blog-data'

export const metadata: Metadata = {
  title: `3D Printing Blog India | Custom 3D Print Ideas & Guides | ${SITE.name}`,
  description: `Expert 3D printing blog India - buy custom 3D printed gifts ideas, materials guide, pricing, how-to tutorials. Learn about 3D printing service, personalised gifts & home decor. ${SITE.name} blog by Agra-based 3D printing experts.`,
  keywords: [
    '3D printing blog India',
    'custom 3D printing ideas',
    '3D printed gifts ideas India',
    'buy 3D printed items guide',
    '3D printing tips India',
    'personalised gifts ideas',
    'custom keepsakes ideas',
    '3D printing materials guide',
    '3D printing service blog',
    'Tathastu Keepsakes blog',
    '3D printed home decor ideas',
  ],
  openGraph: {
    title: `3D Printing Blog India | Gift Ideas & Custom Print Guides | ${SITE.name}`,
    description: `Expert guides on buying 3D printed gifts, custom printing ideas, materials & pricing in India.`,
    type: 'website',
    url: '/blog',
    locale: 'en_IN',
  },
}

const categoryStyles: Record<BlogCategory, string> = {
  services: 'bg-blue-100 text-blue-800',
  products: 'bg-emerald-100 text-emerald-800',
  guides: 'bg-amber-100 text-amber-800',
  brand: 'bg-purple-100 text-purple-800',
}

const categoryLabels: Record<BlogCategory, string> = {
  services: 'Services',
  products: 'Products',
  guides: 'Guides',
  brand: 'Brand',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function BlogPage() {
  return (
    <>
      {/* Page header */}
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink">
          {SITE.name} Blog
        </h1>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl">
          Guides, tips and ideas on 3D printing — from choosing the right
          material to finding the perfect custom gift. Crafted by the{' '}
          {SITE.name} team in Agra.
        </p>
      </header>

      {/* Post grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Cover image */}
            <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">
              {/* Category badge */}
              <span
                className={`inline-block self-start text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 ${categoryStyles[post.category]}`}
              >
                {categoryLabels[post.category]}
              </span>

              {/* Title */}
              <h2 className="text-lg font-semibold text-ink group-hover:text-brand transition-colors line-clamp-2">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-1">
                {post.description}
              </p>

              {/* Meta row */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>{post.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
