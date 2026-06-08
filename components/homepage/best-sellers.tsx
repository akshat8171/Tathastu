import Link from 'next/link'
import Image from 'next/image'

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  label?: string
}

function ProductCard({ id, name, price, originalPrice, image, label }: ProductCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <Link href={`/products/${id}`} className="group">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cream-dark mb-3">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {label && (
          <span className="absolute top-3 left-3 bg-sage-green/90 text-white text-xs font-medium px-3 py-1 rounded-full">
            {label}
          </span>
        )}
      </div>
      <h3 className="font-medium text-charcoal text-sm mb-1">{name}</h3>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-charcoal">₹ {price.toLocaleString('en-IN')}</span>
        {originalPrice && (
          <>
            <span className="text-sm text-charcoal-light line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
            <span className="text-sm text-red-500 font-medium">({discount}% OFF)</span>
          </>
        )}
      </div>
    </Link>
  )
}

export function BestSellers() {
  const products: ProductCardProps[] = [
    { id: '1', name: 'Ancient Dragon Miniature', price: 2499, originalPrice: 2999, image: '/images/products/dragon.jpg', label: 'Trending Now' },
    { id: '2', name: 'Elven Archer Set', price: 1999, image: '/images/products/elf.jpg' },
    { id: '3', name: 'Moon Lithophane Lamp', price: 899, originalPrice: 1199, image: '/images/products/lamp.jpg', label: 'Customer Favourite' },
    { id: '4', name: 'Cyberpunk Hero', price: 2299, originalPrice: 2799, image: '/images/products/cyberpunk.jpg' },
    { id: '5', name: 'Custom LED Name Sign', price: 1499, image: '/images/products/sign.jpg' },
    { id: '6', name: 'Ruined Castle Terrain', price: 3499, originalPrice: 3999, image: '/images/products/castle.jpg', label: 'New' },
  ]

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal text-center mb-10">
          Best Sellers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  )
}
