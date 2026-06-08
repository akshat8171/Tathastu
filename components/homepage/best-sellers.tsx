import Link from 'next/link'
import Image from 'next/image'

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  category: string
}

function ProductCard({ id, name, price, originalPrice, rating, reviewCount, image, category }: ProductCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <Link href={`/products/${id}`} className="card overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-square bg-surface overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-brand-pink text-white text-xs font-bold px-2 py-1 rounded-full">
            {discount}% OFF
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-brand-purple font-medium uppercase tracking-wide mb-1">{category}</p>
        <h3 className="font-display font-semibold text-sm sm:text-base mb-2 line-clamp-2">{name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-400 text-sm">{'★'.repeat(Math.round(rating))}</span>
          <span className="text-xs text-gray-400">({reviewCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">₹{price.toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function BestSellers() {
  const products: ProductCardProps[] = [
    { id: '1', name: 'Ancient Dragon Miniature', price: 2499, originalPrice: 2999, rating: 4.8, reviewCount: 45, image: '/images/products/dragon.jpg', category: 'Miniatures' },
    { id: '2', name: 'Elven Archer Set', price: 1999, rating: 4.5, reviewCount: 32, image: '/images/products/elf.jpg', category: 'Miniatures' },
    { id: '3', name: 'Moon Lithophane Lamp', price: 899, originalPrice: 1199, rating: 4.9, reviewCount: 67, image: '/images/products/lamp.jpg', category: 'Lamps' },
    { id: '4', name: 'Cyberpunk Hero', price: 2299, originalPrice: 2799, rating: 4.7, reviewCount: 28, image: '/images/products/cyberpunk.jpg', category: 'Miniatures' },
    { id: '5', name: 'Custom LED Name Sign', price: 1499, rating: 4.6, reviewCount: 54, image: '/images/products/sign.jpg', category: 'Signs' },
    { id: '6', name: 'Ruined Castle Terrain', price: 3499, originalPrice: 3999, rating: 4.9, reviewCount: 19, image: '/images/products/castle.jpg', category: 'Miniatures' },
  ]

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold">
            Best <span className="gradient-text">Sellers</span>
          </h2>
          <Link href="/products" className="text-brand-purple hover:text-accent-glow font-medium text-sm transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  )
}
