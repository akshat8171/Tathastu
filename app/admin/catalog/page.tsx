'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import type { CatalogListItem } from '@/lib/catalog/types'
import { getProductCategories } from '@/lib/categories'

export default function AdminCatalogPage() {
  const [products, setProducts] = useState<CatalogListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [visibility, setVisibility] = useState('all')

  useEffect(() => {
    fetch('/api/admin/catalog')
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = '/login?next=/admin/catalog'
          return
        }
        if (!response.ok) throw new Error('Failed to load catalog')
        const data = await response.json()
        setProducts(data.products ?? [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load catalog'))
      .finally(() => setLoading(false))
  }, [])

  async function hideOrDelete(item: CatalogListItem) {
    if (item.source === 'json' && item.published) {
      const response = await fetch(`/api/admin/catalog/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: item, published: false }),
      })
      if (!response.ok) {
        alert('Could not hide this SKU')
        return
      }
      setProducts((prev) => prev.map((p) => (p.id === item.id ? { ...p, source: 'admin', published: false } : p)))
      return
    }

    if (!confirm(`Remove admin overlay/SKU "${item.name}"? Seed catalog items will return to the shipped version.`)) {
      return
    }
    const response = await fetch(`/api/admin/catalog/${item.id}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) {
      alert(data.error || 'Could not delete')
      return
    }
    window.location.reload()
  }

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (category !== 'all' && product.category !== category) return false
      if (visibility === 'live' && !product.published) return false
      if (visibility === 'hidden' && product.published) return false
      if (visibility === 'admin' && product.source !== 'admin') return false
      if (!query.trim()) return true
      const hay = `${product.name} ${product.id} ${product.category}`.toLowerCase()
      return hay.includes(query.trim().toLowerCase())
    })
  }, [products, category, visibility, query])

  const categories = getProductCategories()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink">Catalog SKUs</h1>
          <p className="text-muted mt-2">
            Add products that are not in the website file — photos, price, description, and every field shown on the product page.
          </p>
        </div>
        <Link
          href="/admin/catalog/new"
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg font-display font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add SKU
        </Link>
      </div>

      <div className="bg-white rounded-card2 shadow-card p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or SKU id"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.displayName}
            </option>
          ))}
        </select>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All SKUs</option>
          <option value="live">Live on site</option>
          <option value="hidden">Hidden</option>
          <option value="admin">Admin-added / edited</option>
        </select>
      </div>

      {loading && <p className="text-muted">Loading catalog…</p>}
      {error && <p className="text-red-700">{error}</p>}

      {!loading && (
        <div className="bg-white rounded-card2 shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-12 w-12 object-cover rounded border bg-gray-50"
                      />
                      <div>
                        <Link href={`/admin/catalog/${product.id}`} className="font-medium text-ink hover:text-brand">
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{product.category.replace(/-/g, ' ')}</td>
                  <td className="px-4 py-3">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">{product.source === 'admin' ? 'Admin' : 'Website file'}</td>
                  <td className="px-4 py-3">
                    {product.published ? (
                      <span className="text-green-700">Live</span>
                    ) : (
                      <span className="text-amber-700">Hidden</span>
                    )}
                    {product.isSoldOut ? <span className="ml-2 text-red-600">Sold out</span> : null}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/admin/catalog/${product.id}`} className="text-brand font-medium mr-3">
                      Edit
                    </Link>
                    <button type="button" onClick={() => hideOrDelete(product)} className="text-muted hover:text-ink">
                      {product.source === 'json' ? 'Hide' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-6 text-muted">No SKUs match these filters.</p>}
        </div>
      )}
    </div>
  )
}
