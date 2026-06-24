/**
 * Tathastu — canonical category taxonomy.
 *
 * Slugs must match the `category` field in lib/products.json.
 * Images must be real files in public/images/categories/.
 */

export interface Category {
  slug: string
  name: string
  displayName: string
  description: string
  image: string
  /** If true this is a CTA pseudo-category with no products */
  isCta?: boolean
}

export const categories: Category[] = [
  {
    slug: 'lamps',
    name: 'lamps',
    displayName: 'Lamps & Lighting',
    description:
      'Handcrafted 3D-printed lamps that cast the perfect glow — from rustic table lamps to sleek minimalist designs.',
    image: '/images/categories/lamps.jpg',
  },
  {
    slug: 'organizers',
    name: 'organizers',
    displayName: 'Desk & Workspace',
    description:
      'Stylish desk organisers and tissue holders that keep your workspace neat and looking great.',
    image: '/images/categories/organizer.jpg',
  },
  {
    slug: 'planters',
    name: 'planters',
    displayName: 'Planters & Garden',
    description:
      'Unique 3D-printed planters for succulents, herbs, and house plants — stackable, quirky, and space-saving.',
    image: '/images/categories/planter.jpg',
  },
  {
    slug: 'customise',
    name: 'customise',
    displayName: 'Customise Now',
    description:
      "Upload your design and we'll print it for you. Personalised gifts, signs, keychains, and more.",
    image: '/images/categories/customized-signs.jpg',
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
