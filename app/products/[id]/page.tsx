import { ProductGallery } from '@/components/products/product-gallery'
import { ProductInfo } from '@/components/products/product-info'
import Link from 'next/link'

interface ProductDetailPageProps {
  params: Promise<{
    id: string
  }>
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  rating: number
  reviewCount: number
  careGuide?: string
  shippingInfo?: string
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    // For server components, we can directly import the JSON
    // This is more efficient than making an HTTP request
    // When you add DB, replace this with a direct DB query
    const productsData = await import('@/lib/products.json')
    const product = productsData.default.find((p: Product) => p.id === id)
    return product || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return (
      <div className="min-h-screen py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-charcoal mb-4">Product Not Found</h1>
            <p className="text-charcoal/60 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/products"
              className="inline-block bg-sage-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-sage-green/90 transition-colors"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Category mapping to get display name
  const categoryMap: Record<string, string> = {
    lamps: 'Lamps',
    organizers: 'Organizers',
    planters: 'Planters',
    keychains: 'Keychains',
    'customized-signs': 'Customized Signs',
    'customized-miniatures': 'Customized Miniatures',
  }

  const categoryName = categoryMap[product.category] || 'Best Sellers'
  const categoryLink = product.category ? `/products?category=${product.category}` : '/products'

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="breadcrumb g-breadcrumb text-left" role="navigation" aria-label="breadcrumbs">
        <div className="container">
          <Link href="/" title="Home">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={categoryLink} title={categoryName}>{categoryName}</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </div>
      </nav>

      <div className="min-h-screen py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
            <ProductInfo
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              rating={product.rating}
              reviewCount={product.reviewCount}
              description={product.description}
              careGuide={product.careGuide}
              shippingInfo={product.shippingInfo}
            />
          </div>
        </div>
      </div>
    </>
  )
}
