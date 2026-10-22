import { NextRequest, NextResponse } from 'next/server'
import { getCatalogProducts } from '@/lib/catalog/store'

/**
 * Catalog list API — sourced from lib/products.json (+ admin overlays).
 * Do NOT scan public/images here: Next.js file tracing would pack every
 * product PNG into this serverless function and blow the 250MB limit.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category')
    const catalog = await getCatalogProducts()
    const filtered = category
      ? catalog.filter((product) => product.category === category.toLowerCase())
      : catalog

    const products = filtered.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0] ?? '',
      badge: product.badge ?? undefined,
      category: product.category,
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
