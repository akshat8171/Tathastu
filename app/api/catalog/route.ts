import { NextResponse } from 'next/server'
import { getCatalogProducts } from '@/lib/catalog/store'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET() {
  const products = await getCatalogProducts()
  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      images: product.images,
      category: product.category,
      rating: product.rating,
      reviewCount: product.reviewCount,
      badge: product.badge,
      labelType: product.labelType,
      isSoldOut: product.isSoldOut,
      colors: product.colors,
      customizable: product.customizable,
    })),
  })
}
