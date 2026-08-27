/**
 * Catalog product shape shown on the storefront (PDP + cards + admin form).
 * Matches lib/products.json plus admin-only publish flag.
 */

export interface CatalogProductOption {
  name: string
  values: string[]
}

export interface CatalogProductSpecs {
  material?: string
  dimensions?: string
  printTech?: string
  finish?: string
  weight?: string
  origin?: string
}

export interface CatalogProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  rating: number
  reviewCount: number
  badge?: string | null
  labelType?: string | null
  isSoldOut?: boolean
  colors?: string[]
  customizable?: boolean
  customText?: { label: string; maxLength: number; placeholder?: string } | null
  options?: CatalogProductOption[]
  specs?: CatalogProductSpecs | null
  careGuide?: string
  shippingInfo?: string
  benefits?: string[]
  about?: string
  keyFeatures?: string[]
  perfectFor?: string[]
  whyBuy?: string
  createdAt?: string
}

export type CatalogSource = 'json' | 'admin'

export interface CatalogListItem extends CatalogProduct {
  source: CatalogSource
  published: boolean
}

export type HomepageSectionKey =
  | 'hero'
  | 'categories'
  | 'promo'
  | 'bestSellers'
  | 'trust'
  | 'rails'
  | 'reviews'
  | 'photoUpload'
  | 'ideaCta'
  | 'instagram'
  | 'newsletter'

export interface HeroSlide {
  eyebrow: string
  headline: string
  highlight: string
  subcopy: string
  ctaLabel: string
  ctaHref: string
  productIds: string[]
}

export interface CategoryRailConfig {
  slug: string
  title: string
  subtitle: string
}

export interface HomepageSettings {
  sections: Record<HomepageSectionKey, boolean>
  heroSlides: HeroSlide[]
  bestSellerIds: string[]
  promo: {
    enabled: boolean
    headline: string
    subcopy: string
    code: string
  }
  categoryRails: CategoryRailConfig[]
}
