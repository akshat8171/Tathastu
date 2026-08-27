'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { emptyCatalogProduct } from '@/lib/catalog/validate'
import { slugifyCatalogId } from '@/lib/catalog/slug'
import type { CatalogProduct, CatalogProductOption } from '@/lib/catalog/types'
import { getProductCategories } from '@/lib/categories'

interface CatalogProductFormProps {
  mode: 'create' | 'edit'
  initial?: CatalogProduct
  published?: boolean
  source?: 'json' | 'admin'
}

function linesToList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function listToLines(value?: string[]): string {
  return (value ?? []).join('\n')
}

export function CatalogProductForm({
  mode,
  initial,
  published: initialPublished = true,
  source,
}: CatalogProductFormProps) {
  const router = useRouter()
  const categories = getProductCategories()
  const [product, setProduct] = useState<CatalogProduct>(initial ?? emptyCatalogProduct())
  const [published, setPublished] = useState(initialPublished)
  const [idLocked, setIdLocked] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const specs = product.specs ?? {}
  const customText = product.customText

  function patch(partial: Partial<CatalogProduct>) {
    setProduct((current) => {
      const next = { ...current, ...partial }
      if (!idLocked && (partial.name !== undefined || partial.category !== undefined)) {
        next.id = slugifyCatalogId(next.category, next.name)
      }
      return next
    })
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files)
    if (list.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const uploaded: string[] = []
      for (const file of list) {
        const body = new FormData()
        body.append('file', file)
        if (product.id) body.append('productId', product.id)
        const response = await fetch('/api/admin/catalog/upload', { method: 'POST', body })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Upload failed')
        uploaded.push(data.url)
      }
      patch({ images: [...product.images, ...uploaded] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photos')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const url = mode === 'create' ? '/api/admin/catalog' : `/api/admin/catalog/${product.id}`
      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, published }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not save SKU')
      setMessage(published ? 'Saved and live on the website.' : 'Saved as hidden (not shown on the website).')
      if (mode === 'create') {
        router.push(`/admin/catalog/${data.product.id}`)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save SKU')
    } finally {
      setSaving(false)
    }
  }

  const preview = useMemo(() => product.images[0], [product.images])

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {source === 'json' && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          This SKU ships with the website. Saving creates an admin overlay — you can unpublish it without editing the original catalog file.
        </p>
      )}

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
      {message && <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-4 py-3">{message}</p>}

      <section className="bg-white rounded-card2 shadow-card p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-ink">Basics</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-ink">Name</span>
            <input
              value={product.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Category</span>
            <select
              value={product.category}
              onChange={(e) => patch({ category: e.target.value })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">SKU id (URL)</span>
            <input
              value={product.id}
              onChange={(e) => {
                setIdLocked(true)
                patch({ id: e.target.value })
              }}
              disabled={mode === 'edit'}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-50"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Selling price (₹)</span>
            <input
              type="number"
              min={1}
              value={product.price || ''}
              onChange={(e) => patch({ price: Number(e.target.value) })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Original / MRP (₹)</span>
            <input
              type="number"
              min={0}
              value={product.originalPrice || ''}
              onChange={(e) => patch({ originalPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Show on website
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(product.isSoldOut)}
              onChange={(e) => patch({ isSoldOut: e.target.checked })}
            />
            Sold out
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(product.customizable)}
              onChange={(e) => patch({ customizable: e.target.checked })}
            />
            Customizable
          </label>
        </div>
      </section>

      <section className="bg-white rounded-card2 shadow-card p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-ink">Photos</h2>
        <p className="text-sm text-muted">First photo is the card / search thumbnail. Upload several angles.</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files)
            e.target.value = ''
          }}
        />
        {uploading && <p className="text-sm text-muted">Uploading…</p>}
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-32 w-32 object-cover rounded-lg border" />
        )}
        <ul className="space-y-2">
          {product.images.map((src, index) => (
            <li key={`${src}-${index}`} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-12 w-12 object-cover rounded border" />
              <input
                value={src}
                onChange={(e) => {
                  const images = [...product.images]
                  images[index] = e.target.value
                  patch({ images })
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="button"
                className="text-sm text-muted hover:text-ink"
                onClick={() => patch({ images: product.images.filter((_, i) => i !== index) })}
              >
                Remove
              </button>
              {index > 0 && (
                <button
                  type="button"
                  className="text-sm text-muted hover:text-ink"
                  onClick={() => {
                    const images = [...product.images]
                    ;[images[index - 1], images[index]] = [images[index], images[index - 1]]
                    patch({ images })
                  }}
                >
                  Up
                </button>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="text-sm text-brand font-medium"
          onClick={() => patch({ images: [...product.images, ''] })}
        >
          + Add photo URL
        </button>
      </section>

      <section className="bg-white rounded-card2 shadow-card p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-ink">Copy shown on the product page</h2>
        <label className="block">
          <span className="text-sm font-medium text-ink">Description</span>
          <textarea
            rows={5}
            value={product.description}
            onChange={(e) => patch({ description: e.target.value, about: product.about || e.target.value })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Badge</span>
            <input
              value={product.badge ?? ''}
              onChange={(e) => patch({ badge: e.target.value || null })}
              placeholder="New Arrival, Bestseller…"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Label type</span>
            <select
              value={product.labelType ?? ''}
              onChange={(e) => patch({ labelType: e.target.value || null })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">None</option>
              <option value="new">new</option>
              <option value="sale">sale</option>
              <option value="bestseller">bestseller</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Rating (1–5)</span>
            <input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={product.rating}
              onChange={(e) => patch({ rating: Number(e.target.value) })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Review count</span>
            <input
              type="number"
              min={0}
              value={product.reviewCount}
              onChange={(e) => patch({ reviewCount: Number(e.target.value) })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-ink">About</span>
          <textarea
            rows={4}
            value={product.about ?? ''}
            onChange={(e) => patch({ about: e.target.value })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Why buy</span>
          <textarea
            rows={3}
            value={product.whyBuy ?? ''}
            onChange={(e) => patch({ whyBuy: e.target.value })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Benefits (one per line)</span>
            <textarea
              rows={5}
              value={listToLines(product.benefits)}
              onChange={(e) => patch({ benefits: linesToList(e.target.value) })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Key features (one per line)</span>
            <textarea
              rows={5}
              value={listToLines(product.keyFeatures)}
              onChange={(e) => patch({ keyFeatures: linesToList(e.target.value) })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Perfect for (one per line)</span>
            <textarea
              rows={4}
              value={listToLines(product.perfectFor)}
              onChange={(e) => patch({ perfectFor: linesToList(e.target.value) })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Colors (one per line)</span>
            <textarea
              rows={4}
              value={listToLines(product.colors)}
              onChange={(e) => patch({ colors: linesToList(e.target.value) })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-ink">Care guide</span>
          <textarea
            rows={3}
            value={product.careGuide ?? ''}
            onChange={(e) => patch({ careGuide: e.target.value })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Shipping info</span>
          <textarea
            rows={3}
            value={product.shippingInfo ?? ''}
            onChange={(e) => patch({ shippingInfo: e.target.value })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </label>
      </section>

      <section className="bg-white rounded-card2 shadow-card p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-ink">Options & specs</h2>
        {(product.options ?? []).map((option, index) => (
          <div key={index} className="grid sm:grid-cols-2 gap-3">
            <input
              value={option.name}
              placeholder="Option name (Finish, Size…)"
              onChange={(e) => {
                const options = [...(product.options ?? [])]
                options[index] = { ...option, name: e.target.value }
                patch({ options })
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              value={option.values.join(', ')}
              placeholder="Values, comma separated"
              onChange={(e) => {
                const options = [...(product.options ?? [])] as CatalogProductOption[]
                options[index] = { ...option, values: linesToList(e.target.value.replace(/,/g, '\n')) }
                patch({ options })
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        ))}
        <button
          type="button"
          className="text-sm text-brand font-medium"
          onClick={() => patch({ options: [...(product.options ?? []), { name: '', values: [] }] })}
        >
          + Add option
        </button>

        {product.customizable && (
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink">Custom text label</span>
              <input
                value={customText?.label ?? ''}
                onChange={(e) =>
                  patch({
                    customText: {
                      label: e.target.value,
                      maxLength: customText?.maxLength ?? 24,
                      placeholder: customText?.placeholder,
                    },
                  })
                }
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Max length</span>
              <input
                type="number"
                min={1}
                max={120}
                value={customText?.maxLength ?? 24}
                onChange={(e) =>
                  patch({
                    customText: {
                      label: customText?.label ?? 'Name',
                      maxLength: Number(e.target.value),
                      placeholder: customText?.placeholder,
                    },
                  })
                }
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </label>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          {(['material', 'dimensions', 'printTech', 'finish', 'weight', 'origin'] as const).map((key) => (
            <label key={key} className="block">
              <span className="text-sm font-medium text-ink capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <input
                value={specs[key] ?? ''}
                onChange={(e) => patch({ specs: { ...specs, [key]: e.target.value } })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </label>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-3 bg-brand text-white rounded-lg font-display font-semibold disabled:opacity-60"
        >
          {saving ? 'Saving…' : published ? 'Save and publish' : 'Save as hidden'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/catalog')}
          className="px-6 py-3 border border-gray-300 rounded-lg"
        >
          Back to catalog
        </button>
      </div>
    </form>
  )
}
