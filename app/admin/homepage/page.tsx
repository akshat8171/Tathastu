'use client'

import { useEffect, useState } from 'react'
import { HOMEPAGE_SECTION_LABELS } from '@/lib/catalog/homepage-defaults'
import type { CatalogListItem, HeroSlide, HomepageSettings } from '@/lib/catalog/types'

export default function AdminHomepagePage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null)
  const [products, setProducts] = useState<CatalogListItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetch('/api/admin/homepage'), fetch('/api/admin/catalog')])
      .then(async ([home, catalog]) => {
        if (home.status === 401 || catalog.status === 401) {
          window.location.href = '/login?next=/admin/homepage'
          return
        }
        if (!home.ok) throw new Error('Failed to load homepage settings')
        const homeData = await home.json()
        const catalogData = catalog.ok ? await catalog.json() : { products: [] }
        setSettings(homeData.settings)
        setProducts(catalogData.products ?? [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not save')
      setSettings(data.settings)
      setMessage('Landing page updated. Refresh the homepage to see it.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return <p className="text-muted">{error ?? 'Loading homepage controls…'}</p>
  }

  const liveIds = products.filter((p) => p.published).map((p) => p.id)

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-ink">Landing page</h1>
        <p className="text-muted mt-2">
          Choose which homepage sections are visible, which products appear in the hero and best sellers, and the promo copy.
        </p>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
      {message && <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-4 py-3">{message}</p>}

      <section className="bg-white rounded-card2 shadow-card p-6">
        <h2 className="text-lg font-display font-semibold text-ink mb-4">Sections</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(Object.keys(HOMEPAGE_SECTION_LABELS) as Array<keyof typeof HOMEPAGE_SECTION_LABELS>).map((key) => (
            <label key={key} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.sections[key]}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sections: { ...settings.sections, [key]: e.target.checked },
                  })
                }
              />
              {HOMEPAGE_SECTION_LABELS[key]}
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-card2 shadow-card p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-ink">Promo strip</h2>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.promo.enabled}
            onChange={(e) => setSettings({ ...settings, promo: { ...settings.promo, enabled: e.target.checked } })}
          />
          Show promo strip
        </label>
        <label className="block">
          <span className="text-sm font-medium">Headline</span>
          <input
            value={settings.promo.headline}
            onChange={(e) => setSettings({ ...settings, promo: { ...settings.promo, headline: e.target.value } })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Subcopy</span>
          <input
            value={settings.promo.subcopy}
            onChange={(e) => setSettings({ ...settings, promo: { ...settings.promo, subcopy: e.target.value } })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Code shown</span>
          <input
            value={settings.promo.code}
            onChange={(e) => setSettings({ ...settings, promo: { ...settings.promo, code: e.target.value } })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </label>
      </section>

      <section className="bg-white rounded-card2 shadow-card p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-ink">Best sellers (SKU ids, one per line)</h2>
        <textarea
          rows={8}
          value={settings.bestSellerIds.join('\n')}
          onChange={(e) =>
            setSettings({
              ...settings,
              bestSellerIds: e.target.value
                .split('\n')
                .map((id) => id.trim())
                .filter(Boolean),
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
        />
        <p className="text-xs text-muted">Live SKUs: {liveIds.slice(0, 12).join(', ')}{liveIds.length > 12 ? '…' : ''}</p>
      </section>

      <section className="bg-white rounded-card2 shadow-card p-6 space-y-6">
        <h2 className="text-lg font-display font-semibold text-ink">Hero slides</h2>
        {settings.heroSlides.map((slide, index) => (
          <HeroSlideFields
            key={index}
            slide={slide}
            onChange={(next) => {
              const heroSlides = [...settings.heroSlides]
              heroSlides[index] = next
              setSettings({ ...settings, heroSlides })
            }}
            onRemove={() =>
              setSettings({
                ...settings,
                heroSlides: settings.heroSlides.filter((_, i) => i !== index),
              })
            }
          />
        ))}
        <button
          type="button"
          className="text-sm text-brand font-medium"
          onClick={() =>
            setSettings({
              ...settings,
              heroSlides: [
                ...settings.heroSlides,
                {
                  eyebrow: 'New',
                  headline: 'Made to order,',
                  highlight: 'just for you.',
                  subcopy: '',
                  ctaLabel: 'Shop now',
                  ctaHref: '/products',
                  productIds: [],
                },
              ],
            })
          }
        >
          + Add slide
        </button>
      </section>

      <section className="bg-white rounded-card2 shadow-card p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-ink">Category rails</h2>
        {settings.categoryRails.map((rail, index) => (
          <div key={index} className="grid sm:grid-cols-3 gap-3">
            <input
              value={rail.slug}
              placeholder="category slug"
              onChange={(e) => {
                const categoryRails = [...settings.categoryRails]
                categoryRails[index] = { ...rail, slug: e.target.value }
                setSettings({ ...settings, categoryRails })
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              value={rail.title}
              placeholder="Title"
              onChange={(e) => {
                const categoryRails = [...settings.categoryRails]
                categoryRails[index] = { ...rail, title: e.target.value }
                setSettings({ ...settings, categoryRails })
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              value={rail.subtitle}
              placeholder="Subtitle"
              onChange={(e) => {
                const categoryRails = [...settings.categoryRails]
                categoryRails[index] = { ...rail, subtitle: e.target.value }
                setSettings({ ...settings, categoryRails })
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        ))}
      </section>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="px-6 py-3 bg-brand text-white rounded-lg font-display font-semibold disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save landing page'}
      </button>
    </div>
  )
}

function HeroSlideFields({
  slide,
  onChange,
  onRemove,
}: {
  slide: HeroSlide
  onChange: (slide: HeroSlide) => void
  onRemove: () => void
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={slide.eyebrow}
          onChange={(e) => onChange({ ...slide, eyebrow: e.target.value })}
          placeholder="Eyebrow"
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          value={slide.ctaHref}
          onChange={(e) => onChange({ ...slide, ctaHref: e.target.value })}
          placeholder="CTA link"
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          value={slide.headline}
          onChange={(e) => onChange({ ...slide, headline: e.target.value })}
          placeholder="Headline"
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          value={slide.highlight}
          onChange={(e) => onChange({ ...slide, highlight: e.target.value })}
          placeholder="Highlight"
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          value={slide.ctaLabel}
          onChange={(e) => onChange({ ...slide, ctaLabel: e.target.value })}
          placeholder="CTA label"
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <textarea
        value={slide.subcopy}
        onChange={(e) => onChange({ ...slide, subcopy: e.target.value })}
        placeholder="Subcopy"
        rows={2}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <label className="block">
        <span className="text-sm font-medium">Product ids on this slide (one per line)</span>
        <textarea
          rows={3}
          value={slide.productIds.join('\n')}
          onChange={(e) =>
            onChange({
              ...slide,
              productIds: e.target.value
                .split('\n')
                .map((id) => id.trim())
                .filter(Boolean),
            })
          }
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
        />
      </label>
      <button type="button" onClick={onRemove} className="text-sm text-muted hover:text-ink">
        Remove slide
      </button>
    </div>
  )
}
