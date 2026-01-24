import { ProductGallery } from '@/components/products/product-gallery'
import { ProductInfo } from '@/components/products/product-info'

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

// This would typically fetch from Supabase
const productData = {
  id: '1',
  name: 'Ancient Dragon Miniature',
  price: 2499,
  originalPrice: 2999,
  images: [
    '/images/products/dragon.jpg',
    '/images/products/dragon-2.jpg',
    '/images/products/dragon-3.jpg',
  ],
  rating: 4.5,
  reviewCount: 35,
  description:
    'This exquisitely detailed Ancient Dragon miniature is perfect for tabletop gaming and painting enthusiasts. Printed in high-resolution resin, every scale and texture is captured with precision. The model comes unpainted, allowing you to bring your artistic vision to life. Ideal for D&D campaigns, Warhammer, or as a stunning display piece.',
  careGuide:
    'Handle with care. Use a soft brush to remove dust. For painting, prime with a quality miniature primer before applying acrylic paints. Store in a cool, dry place away from direct sunlight.',
  shippingInfo:
    'We ship worldwide. Standard shipping takes 5-7 business days. Express shipping available. All items are carefully packaged to prevent damage during transit.',
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <div className="bg-cream min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductGallery
            images={productData.images}
            productName={productData.name}
          />
          <ProductInfo
            name={productData.name}
            price={productData.price}
            originalPrice={productData.originalPrice}
            rating={productData.rating}
            reviewCount={productData.reviewCount}
            description={productData.description}
            careGuide={productData.careGuide}
            shippingInfo={productData.shippingInfo}
          />
        </div>
      </div>
    </div>
  )
}
