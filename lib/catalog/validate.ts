import { getProductCategories } from '@/lib/categories'
import { isValidCatalogId } from './slug'
import type { CatalogProduct, CatalogProductOption, CatalogProductSpecs } from './types'

const MAX_IMAGES = 12
const MAX_TEXT = 8000
const ALLOWED_CATEGORIES = new Set(getProductCategories().map((c) => c.slug))

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asStringList(value: unknown, max = 24): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => asString(item))
    .filter(Boolean)
    .slice(0, max)
}

function asOptions(value: unknown): CatalogProductOption[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name = asString(row.name)
      const values = asStringList(row.values, 40)
      if (!name || values.length === 0) return null
      return { name, values }
    })
    .filter((item): item is CatalogProductOption => item !== null)
    .slice(0, 8)
}

function asSpecs(value: unknown): CatalogProductSpecs | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const specs: CatalogProductSpecs = {
    material: asString(row.material) || undefined,
    dimensions: asString(row.dimensions) || undefined,
    printTech: asString(row.printTech) || undefined,
    finish: asString(row.finish) || undefined,
    weight: asString(row.weight) || undefined,
    origin: asString(row.origin) || undefined,
  }
  return Object.values(specs).some(Boolean) ? specs : null
}

function asCustomText(value: unknown): CatalogProduct['customText'] {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const label = asString(row.label)
  const maxLength = Math.min(120, Math.max(1, Math.round(asNumber(row.maxLength, 24))))
  if (!label) return null
  return {
    label,
    maxLength,
    placeholder: asString(row.placeholder) || undefined,
  }
}

function isImageSrc(value: string): boolean {
  return value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://localhost')
}

export function normalizeCatalogPayload(raw: unknown): CatalogProduct | { error: string } {
  if (!raw || typeof raw !== 'object') return { error: 'Product details are required' }
  const row = raw as Record<string, unknown>

  const id = asString(row.id).toLowerCase()
  if (!isValidCatalogId(id)) {
    return { error: 'SKU id must be a lowercase slug (letters, numbers, hyphens), 3–80 characters' }
  }

  const name = asString(row.name)
  if (name.length < 2) return { error: 'Name is required' }

  const description = asString(row.description).slice(0, MAX_TEXT)
  if (description.length < 8) return { error: 'Description must be at least 8 characters' }

  const category = asString(row.category)
  if (!ALLOWED_CATEGORIES.has(category)) return { error: 'Pick a valid website category' }

  const price = Math.round(asNumber(row.price, 0))
  if (price < 1) return { error: 'Price must be at least ₹1' }

  const originalPriceRaw = row.originalPrice
  const originalPrice =
    originalPriceRaw === null || originalPriceRaw === undefined || originalPriceRaw === ''
      ? undefined
      : Math.round(asNumber(originalPriceRaw, 0))
  if (originalPrice !== undefined && originalPrice < price) {
    return { error: 'Original price must be greater than or equal to selling price' }
  }

  const images = asStringList(row.images, MAX_IMAGES).filter(isImageSrc)
  if (images.length === 0) return { error: 'Add at least one product photo' }

  const rating = Math.min(5, Math.max(1, asNumber(row.rating, 5)))
  const reviewCount = Math.max(0, Math.round(asNumber(row.reviewCount, 0)))

  const payload: CatalogProduct = {
    id,
    name,
    description,
    price,
    originalPrice,
    images,
    category,
    rating: Math.round(rating * 10) / 10,
    reviewCount,
    badge: asString(row.badge) || null,
    labelType: asString(row.labelType) || null,
    isSoldOut: Boolean(row.isSoldOut),
    colors: asStringList(row.colors, 20),
    customizable: Boolean(row.customizable),
    customText: asCustomText(row.customText),
    options: asOptions(row.options),
    specs: asSpecs(row.specs),
    careGuide: asString(row.careGuide).slice(0, MAX_TEXT) || undefined,
    shippingInfo: asString(row.shippingInfo).slice(0, MAX_TEXT) || undefined,
    benefits: asStringList(row.benefits, 12),
    about: asString(row.about).slice(0, MAX_TEXT) || undefined,
    keyFeatures: asStringList(row.keyFeatures, 12),
    perfectFor: asStringList(row.perfectFor, 12),
    whyBuy: asString(row.whyBuy).slice(0, MAX_TEXT) || undefined,
    createdAt: asString(row.createdAt) || new Date().toISOString(),
  }

  return payload
}

export function emptyCatalogProduct(): CatalogProduct {
  return {
    id: '',
    name: '',
    description: '',
    price: 0,
    images: [],
    category: 'keyrings',
    rating: 5,
    reviewCount: 0,
    badge: null,
    labelType: null,
    isSoldOut: false,
    colors: [],
    customizable: false,
    customText: null,
    options: [],
    specs: {
      material: 'PLA / PLA+',
      printTech: 'Multi-colour FDM',
      finish: 'Matte',
      origin: 'Made in India',
    },
    careGuide: '',
    shippingInfo: 'Standard delivery takes 3–5 business days. Express delivery available for metro cities.',
    benefits: [],
    about: '',
    keyFeatures: [],
    perfectFor: [],
    whyBuy: '',
    createdAt: new Date().toISOString(),
  }
}
