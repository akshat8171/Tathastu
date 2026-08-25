'use client'

import Link from 'next/link'
import { CatalogProductForm } from '@/components/admin/catalog-product-form'

export default function NewCatalogProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/catalog" className="text-sm text-brand font-medium">
          ← Catalog
        </Link>
        <h1 className="text-3xl font-display font-bold text-ink mt-2">Add SKU</h1>
        <p className="text-muted mt-2">
          Fill in the same metadata the product page shows: photos, price, description, options, specs, and merchandising copy.
        </p>
      </div>
      <CatalogProductForm mode="create" />
    </div>
  )
}
