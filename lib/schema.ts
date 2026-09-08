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
    logo: `${Config.appUrl}/images/logo/tathastu-keepsakes-logo.svg`,
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
      addressLocality: 'Agra',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    sameAs: [SITE.instagram, SITE.facebook, SITE.whatsapp],
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    priceRange: '₹199 - ₹9999',
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
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Agra',
      addressRegion: 'Uttar Pradesh',
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
 * Use on homepage.
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
        urlTemplate: `${Config.appUrl}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
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

  return {
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  }
}
