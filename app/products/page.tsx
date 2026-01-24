import { ProductCard, ProductCardProps } from '@/components/products/product-card'

const products: ProductCardProps[] = [
  {
    id: '1',
    name: 'Ancient Dragon Miniature',
    price: 2499,
    originalPrice: 2999,
    image: '/images/products/dragon.jpg',
    badge: 'Trending Now',
    category: 'fantasy',
  },
  {
    id: '2',
    name: 'Elven Archer Set',
    price: 1999,
    image: '/images/products/elven-archer.jpg',
    category: 'fantasy',
  },
  {
    id: '3',
    name: 'Ruined Castle Terrain',
    price: 3499,
    image: '/images/products/castle-terrain.jpg',
    category: 'terrain',
  },
  {
    id: '4',
    name: 'Cyberpunk Hero',
    price: 2299,
    originalPrice: 2799,
    image: '/images/products/cyberpunk-hero.jpg',
    badge: 'Current Mood',
    category: 'sci-fi',
  },
  {
    id: '5',
    name: 'Stone Troll',
    price: 1799,
    image: '/images/products/stone-troll.jpg',
    category: 'fantasy',
  },
  {
    id: '6',
    name: 'Treasure Chest',
    price: 1299,
    image: '/images/products/treasure-chest.jpg',
    category: 'fantasy',
  },
]

export default function ProductsPage() {
  return (
    <div className="bg-cream min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="font-sans text-lg text-charcoal/70 mb-2 uppercase tracking-wide">
            REAL ADULTS DON'T PLAY WITH TOYS
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-charcoal mb-4">
            MINIATURES & TERRAIN
          </h1>
          <p className="font-sans text-lg text-charcoal/70 mb-2 uppercase tracking-wide">
            BECAUSE YOUR TABLETOP DESERVES ART
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-8 mb-12 border-b border-charcoal/20">
          <button className="pb-4 px-4 border-b-2 border-charcoal font-semibold text-charcoal">
            All
          </button>
          <button className="pb-4 px-4 text-charcoal/60 hover:text-charcoal transition-colors">
            Fantasy
          </button>
          <button className="pb-4 px-4 text-charcoal/60 hover:text-charcoal transition-colors">
            Sci-Fi
          </button>
          <button className="pb-4 px-4 text-charcoal/60 hover:text-charcoal transition-colors">
            Terrain
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button className="bg-slate-blue hover:bg-slate-blue/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
            SHOP THE COLLECTION
          </button>
        </div>
      </div>
    </div>
  )
}
