'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CatalogProductForm } from '@/components/admin/catalog-product-form'
import type { CatalogListItem } from '@/lib/catalog/types'

export default function EditCatalogProductPage() {
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<CatalogListItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/catalog/${params.id}`)
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = `/login?next=/admin/catalog/${params.id}`
          return
        }
        if (!response.ok) throw new Error('SKU not found')
        const data = await response.json()
        setProduct(data.product)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'SKU not found'))
  }, [params.id])

  if (error) {
    return (
      <div>
        <p className="text-red-700">{error}</p>
        <Link href="/admin/catalog" className="text-brand text-sm mt-3 inline-block">
          Back to catalog
        </Link>
      </div>
    )
  }

  if (!product) return <p className="text-muted">Loading SKU…</p>

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/catalog" className="text-sm text-brand font-medium">
          ← Catalog
        </Link>
        <h1 className="text-3xl font-display font-bold text-ink mt-2">{product.name}</h1>
        <p className="text-muted mt-2">
          Edit every field shown on the product page. Preview:{' '}
          <a href={`/products/${product.id}`} className="text-brand" target="_blank" rel="noreferrer">
            view on website
          </a>
        </p>
      </div>
      <CatalogProductForm
        mode="edit"
        initial={product}
        published={product.published}
        source={product.source}
      />
    </div>
  )
}
