/**
 * app/blog/[slug]/page.tsx — Individual blog post page.
 *
 * Dynamic route that renders full blog articles with:
 * - Schema.org BlogPosting structured data (JSON-LD)
 * - Dynamic SEO metadata via generateMetadata
 * - Proper heading hierarchy
 * - Breadcrumbs, share buttons, and CTA
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SITE } from '@/lib/site'
import { getBreadcrumbSchema } from '@/lib/schema'
import { blogPosts, getBlogPost, getAllSlugs } from '@/lib/blog-data'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Generate static params for all blog slugs at build time.
 */
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

/**
 * Generate dynamic metadata for each blog post.
 */
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}

  return {
    title: `${post.title} | ${SITE.name}`,
    description: post.description,
    keywords: post.keywords.split(', '),
    authors: [{ name: 'Tathastu Keepsakes Team' }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: ['Tathastu Keepsakes Team'],
      url: `/blog/${post.slug}`,
      ...(post.coverImage && { images: [{ url: post.coverImage }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'Tathastu Keepsakes',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `/blog/${post.slug}`,
    },
    ...(post.coverImage && {
      image: post.coverImage,
    }),
    keywords: post.keywords,
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ])

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-brand transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/blog" className="hover:text-brand transition-colors">
              Blog
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-none">
            {post.title}
          </li>
        </ol>
      </nav>

      {/* Article */}
      <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Cover Image Hero */}
        {post.coverImage && (
          <div className="w-full aspect-[21/9] sm:aspect-[21/9] md:aspect-[2.4/1] relative overflow-hidden bg-gray-100">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Header */}
        <header className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b border-gray-100">
          {/* Category badge */}
          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand mb-4 capitalize">
            {post.category}
          </span>

          {/* H1 title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>By Tathastu Keepsakes Team</span>
            <span aria-hidden="true">|</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">|</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        {/* Body */}
        <div className="px-6 sm:px-10 py-8 sm:py-10">
          {post.content ? (
            <div
              className="prose prose-lg max-w-none prose-headings:text-ink prose-a:text-brand prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">Article content coming soon.</p>
              <p className="mt-2 text-sm">
                Check back shortly — we are crafting this guide for you.
              </p>
            </div>
          )}
        </div>

        {/* Share buttons */}
        <div className="px-6 sm:px-10 py-5 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Share:</span>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(post.title + ' — /blog/' + post.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.18-3.01.79.8-2.93-.19-.31A7.96 7.96 0 014 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8z" />
            </svg>
            WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent('/blog/' + post.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sky-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter
          </a>
        </div>
      </article>

      {/* CTA Section */}
      <section className="mt-10 bg-brand/5 border border-brand/20 rounded-xl p-6 sm:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-ink">
          Have a custom 3D printing idea?
        </h2>
        <p className="mt-2 text-gray-600 max-w-lg mx-auto">
          Upload your design or describe your idea — get a free quote from{' '}
          {SITE.name} within 24 hours. PAN India delivery from Agra.
        </p>
        <Link
          href="/custom-3d-printing"
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors"
        >
          Get a Free Quote
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>

      {/* Related posts */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-ink mb-5">More from the blog</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts
            .filter((p) => p.slug !== post.slug)
            .slice(0, 3)
            .map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-sm font-semibold text-ink line-clamp-2">
                  {related.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500">{related.readTime}</p>
              </Link>
            ))}
        </div>
      </section>
    </>
  )
}
