import { NextRequest, NextResponse } from 'next/server'
import productsData from '@/lib/products.json'

interface ProductDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: ProductDetailPageProps
) {
  try {
    const { id } = await params
    
    const product = productsData.find((p) => p.id === id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
