import { getAllProducts, getProductsByCategory } from '@/lib/supabase/products'
import Link from 'next/link'
import Image from 'next/image'

const CATEGORIES = [
  { slug: 'all', label: 'All' },
  { slug: 'miniatures', label: 'Miniatures' },
  { slug: 'lamps', label: 'Lamps' },
  { slug: 'signs', label: 'Signs' },
  { slug: 'custom', label: 'Custom' },
]

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const category = searchParams.category
  const products = category && category !== 'all'
    ? await getProductsByCategory(category)
    : await getAllProducts()

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-display font-bold mb-8">
        {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Products'}
      </h1>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.slug}
            href={cat.slug === 'all' ? '/products' : `/products?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              (category || 'all') === cat.slug
                ? 'bg-sage-green text-white'
                : 'bg-white border border-warm-border text-charcoal hover:border-sage-green'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-charcoal-light text-lg">No products found in this category yet.</p>
          <Link href="/products" className="text-sage-green hover:underline mt-2 inline-block">View all products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <Link key={product.id} href={`/products/${product.id}`} className="card overflow-hidden group">
              <div className="relative aspect-square bg-cream-dark overflow-hidden">
                {product.images?.[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                {product.discount_percentage && product.discount_percentage > 0 && (
                  <span className="absolute top-3 left-3 bg-sage-green text-white text-xs font-bold px-2 py-1 rounded-full">
                    {product.discount_percentage}% OFF
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-sage-green font-medium uppercase tracking-wide mb-1">{product.category}</p>
                <h3 className="font-display font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(product.rating))}</span>
                  <span className="text-xs text-charcoal-light">({product.review_count})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.original_price && (
                    <span className="text-xs text-charcoal-light line-through">₹{product.original_price.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
