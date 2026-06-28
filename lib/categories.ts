/**
 * Tathastu Keepsakes — canonical category taxonomy.
 *
 * Slugs must match the `category` field in lib/products.json.
 * Images must be real files in public/images/.
 *
 * Order here is the display order on the homepage "Shop by Category" rail.
 *
 * FROZEN CONTRACT §4: keep slugs, displayNames, and helper exports stable.
 * You MAY use `route` for per-category clean URLs (/shop/<slug>).
 */

export interface Category {
  slug: string
  name: string
  displayName: string
  description: string
  image: string
  /** Optional clean URL for this category page. */
  route?: string
  /** If true this is a CTA pseudo-category with no products */
  isCta?: boolean
}

export const categories: Category[] = [
  {
    slug: 'pooja-decor',
    name: 'pooja-decor',
    displayName: 'Pooja & Decor',
    description:
      'Devotional pieces, beautifully printed — idols, temples, and incense holders crafted to order for your sacred space.',
    image: '/images/3dps/categories/pooja-decor.png',
    route: '/products?category=pooja-decor',
  },
  {
    slug: 'keyrings',
    name: 'keyrings',
    displayName: 'Keyrings & Bag Tags',
    description:
      'Personalised, multi-colour and built to last — name keyrings, bag tags, and fun collectible charms.',
    image: '/images/3dps/categories/keyrings.png',
    route: '/products?category=keyrings',
  },
  {
    slug: 'gaming',
    name: 'gaming',
    displayName: 'Gaming',
    description:
      'Collectible 3D-printed pieces for fans and gamers — crisp detail and vibrant colour, made to order.',
    image: '/images/3dps/categories/gaming.png',
    route: '/products?category=gaming',
  },
  {
    slug: 'lamps',
    name: 'lamps',
    displayName: 'Lamps & Lighting',
    description:
      'Handcrafted 3D-printed lamps that cast the perfect glow — from rustic table lamps to sleek minimalist designs.',
    image: '/images/categories/lamps.jpg',
    route: '/products?category=lamps',
  },
  {
    slug: 'organizers',
    name: 'organizers',
    displayName: 'Desk & Workspace',
    description:
      'Stylish desk organisers, phone stands, and tissue holders that keep your workspace neat and looking great.',
    image: '/images/3dps/categories/workspace.png',
    route: '/products?category=organizers',
  },
  {
    slug: 'planters',
    name: 'planters',
    displayName: 'Planters & Garden',
    description:
      'Unique 3D-printed planters for succulents, herbs, and house plants — stackable, quirky, and space-saving.',
    image: '/images/categories/planter.jpg',
    route: '/products?category=planters',
  },
  {
    slug: 'customise',
    name: 'customise',
    displayName: 'Customise Now',
    description:
      "Upload your design and we'll print it for you. Personalised gifts, signs, keychains, and more.",
    image: '/images/3dps/categories/customized.png',
    route: '/customize',
    isCta: true,
  },
]

/**
 * Returns the category matching the given slug, or undefined.
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

/**
 * Returns only product-backed categories (excludes isCta pseudo-categories).
 */
export function getProductCategories(): Category[] {
  return categories.filter((c) => !c.isCta)
}
