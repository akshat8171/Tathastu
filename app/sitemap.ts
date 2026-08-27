/**
 * app/sitemap.ts — Dynamic sitemap generation for Tathastu Keepsakes
 *
 * Generates XML sitemap with all static pages, dynamic blog posts, and product categories.
 * Helps search engines discover and index all pages efficiently.
 */

import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'
import { getProductCategories } from '@/lib/categories'
import { getCatalogProducts } from '@/lib/catalog/store'

const BASE_URL = 'https://www.tathastukeepsakes.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString()
  const catalog = await getCatalogProducts()

  // Static pages with priority and change frequency
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/custom-3d-printing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/rakhi`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/bulk-order`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faqs`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/refund-and-returns-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/shipping-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Product categories
  const categories = getProductCategories()
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/products?category=${category.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Individual product detail pages (/products/[id]) — the highest-converting
  // SEO surface (each carries Product + AggregateRating + Offer JSON-LD for
  // rich results). Previously absent from the sitemap, so product pages were
  // left to organic discovery only. Rakhi SKUs get a small priority bump so
  // they are crawled first during the pre-festival window.
  const productPages: MetadataRoute.Sitemap = catalog.map((product) => ({
    url: `${BASE_URL}/products/${product.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: product.category === 'rakhi' ? 0.9 : 0.7,
  }))

  return [...staticPages, ...blogPages, ...categoryPages, ...productPages]
}
