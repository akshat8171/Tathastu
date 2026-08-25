import { DEFAULT_HOMEPAGE_SETTINGS } from './homepage-defaults'
import type {
  CategoryRailConfig,
  HeroSlide,
  HomepageSectionKey,
  HomepageSettings,
} from './types'

const SECTION_KEYS = Object.keys(DEFAULT_HOMEPAGE_SETTINGS.sections) as HomepageSectionKey[]

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asStringList(value: unknown, max = 12): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => asString(item).trim())
    .filter(Boolean)
    .slice(0, max)
}

function mergeHeroSlide(raw: unknown, fallback: HeroSlide): HeroSlide {
  if (!raw || typeof raw !== 'object') return fallback
  const row = raw as Record<string, unknown>
  return {
    eyebrow: asString(row.eyebrow, fallback.eyebrow).slice(0, 80),
    headline: asString(row.headline, fallback.headline).slice(0, 80),
    highlight: asString(row.highlight, fallback.highlight).slice(0, 80),
    subcopy: asString(row.subcopy, fallback.subcopy).slice(0, 400),
    ctaLabel: asString(row.ctaLabel, fallback.ctaLabel).slice(0, 40),
    ctaHref: asString(row.ctaHref, fallback.ctaHref).slice(0, 200),
    productIds: asStringList(row.productIds, 8),
  }
}

function mergeRails(raw: unknown): CategoryRailConfig[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_HOMEPAGE_SETTINGS.categoryRails
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const slug = asString(row.slug).trim()
      const title = asString(row.title).trim()
      if (!slug || !title) return null
      return {
        slug,
        title: title.slice(0, 80),
        subtitle: asString(row.subtitle).slice(0, 160),
      }
    })
    .filter((item): item is CategoryRailConfig => item !== null)
    .slice(0, 8)
}

export function mergeHomepageSettings(raw: unknown): HomepageSettings {
  const defaults = DEFAULT_HOMEPAGE_SETTINGS
  if (!raw || typeof raw !== 'object') return defaults
  const row = raw as Record<string, unknown>
  const sectionsRaw = (row.sections ?? {}) as Record<string, unknown>
  const promoRaw = (row.promo ?? {}) as Record<string, unknown>
  const heroRaw = Array.isArray(row.heroSlides) ? row.heroSlides : defaults.heroSlides

  const sections = { ...defaults.sections }
  for (const key of SECTION_KEYS) {
    if (typeof sectionsRaw[key] === 'boolean') sections[key] = sectionsRaw[key]
  }

  return {
    sections,
    heroSlides: heroRaw
      .slice(0, 6)
      .map((slide, index) => mergeHeroSlide(slide, defaults.heroSlides[index] ?? defaults.heroSlides[0])),
    bestSellerIds: asStringList(row.bestSellerIds, 16),
    promo: {
      enabled: typeof promoRaw.enabled === 'boolean' ? promoRaw.enabled : defaults.promo.enabled,
      headline: asString(promoRaw.headline, defaults.promo.headline).slice(0, 120),
      subcopy: asString(promoRaw.subcopy, defaults.promo.subcopy).slice(0, 200),
      code: asString(promoRaw.code, defaults.promo.code).slice(0, 32).toUpperCase(),
    },
    categoryRails: mergeRails(row.categoryRails),
  }
}
