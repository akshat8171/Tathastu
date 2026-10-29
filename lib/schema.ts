/**
 * lib/schema.ts — Schema.org JSON-LD structured data helpers.
 *
 * Provides type-safe builders for Organization, LocalBusiness, WebSite,
 * BreadcrumbList, and FAQPage schemas. Used across layout and pages to
 * improve Google rich results visibility.
 */

import { Config } from './config'
import { SITE } from './site'

/**
 * Organization schema — represents Tathastu Keepsakes as a business entity.
 * Use in root layout for global context.
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    description: SITE.tagline,
    url: Config.appUrl,
    // Prefer raster logo for Google Organization eligibility (SVG often ignored).
    logo: `${Config.appUrl}/images/logo/tk-mark-512.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE.phone,
      email: SITE.email,
      contactType: 'Customer Service',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Agra Workshop',
      addressLocality: 'Agra',
      addressRegion: 'Uttar Pradesh',
      postalCode: '282001',
      addressCountry: 'IN',
    },
    sameAs: [SITE.instagram, SITE.facebook, SITE.whatsapp],
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    priceRange: '₹199 - ₹9999',
    founder: {
      '@type': 'Person',
      name: 'Akshat Garg',
      jobTitle: 'Founder',
      worksFor: { '@type': 'Organization', name: SITE.name },
    },
  }
}

/**
 * LocalBusiness schema — for contact/location pages.
 * Includes geo coordinates and opening hours.
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE.name,
    description: SITE.tagline,
    url: Config.appUrl,
    telephone: SITE.phone,
    email: SITE.email,
    image: `${Config.appUrl}/images/logo/tk-mark-512.png`,
    logo: `${Config.appUrl}/images/logo/tk-mark-512.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Agra Workshop',
      addressLocality: 'Agra',
      addressRegion: 'Uttar Pradesh',
      postalCode: '282001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 27.1767,
      longitude: 78.0081,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '19:00',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    priceRange: '₹199 - ₹9999',
  }
}

/**
 * WebSite schema with SearchAction — enables Google sitelinks search box.
 * Use on homepage. Points at /products?q= (primary catalog; /shop redirects).
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: Config.appUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${Config.appUrl}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Founder Person schema — E-E-A-T signal for About. */
export function getFounderPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Akshat Garg',
    jobTitle: 'Founder',
    worksFor: {
      '@type': 'Organization',
      name: SITE.name,
      url: Config.appUrl,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Agra',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    url: `${Config.appUrl}/about`,
  }
}

/** CollectionPage / ItemList for catalog & blog indexes. */
export function getCollectionPageSchema(opts: {
  name: string
  description: string
  urlPath: string
  items: Array<{ name: string; urlPath: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: `${Config.appUrl}${opts.urlPath}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: `${Config.appUrl}${item.urlPath}`,
      })),
    },
  }
}

/**
 * BreadcrumbList schema — for hierarchical navigation.
 *
 * @param items Array of breadcrumb items { name, url }
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${Config.appUrl}${item.url}`,
    })),
  }
}

/**
 * FAQPage schema — for pages with FAQ sections.
 *
 * @param faqs Array of { question, answer } pairs
 */
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Product schema — for product detail pages.
 *
 * @param product Product data including name, description, price, images, etc.
 */
export function getProductSchema(product: {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  rating: number
  reviewCount: number
}) {
  const productUrl = `${Config.appUrl}/products/${product.id}`

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => `${Config.appUrl}${img}`),
    brand: {
      '@type': 'Brand',
      name: SITE.name,
    },
    sku: product.id,
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      seller: {
        '@type': 'Organization',
        name: SITE.name,
      },
    },
  }

  // Google rejects AggregateRating when reviewCount is 0 (and a 5★ with zero
  // reviews is also a trust/spam signal). Only emit when we have real reviews.
  if (product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return schema
}
