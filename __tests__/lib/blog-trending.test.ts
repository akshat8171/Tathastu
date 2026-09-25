import { getBlogPost, blogPosts } from '@/lib/blog-data'
import products from '@/lib/products.json'

const TRENDING_SLUGS = [
  'customised-car-dashboard-3d-printed-india',
  '3d-printed-moon-lamp-india',
  '3d-printed-desk-organizer-india',
  '3d-printed-planters-india',
] as const

type CatalogProduct = { id: string; name: string; price: number }

const catalog = products as CatalogProduct[]

function product(id: string): CatalogProduct {
  const match = catalog.find((item) => item.id === id)
  if (!match) throw new Error(`Missing catalog product ${id}`)
  return match
}

describe('trending blog posts', () => {
  it('lists the four new posts first', () => {
    expect(blogPosts.slice(0, 4).map((post) => post.slug)).toEqual([...TRENDING_SLUGS])
  })

  it.each(TRENDING_SLUGS)('%s answers in the opening line and includes FAQ markup', (slug) => {
    const post = getBlogPost(slug)
    expect(post).toBeDefined()
    expect(post?.description.length).toBeGreaterThan(40)
    expect(post?.content.startsWith('<article')).toBe(true)
    expect(post?.content).toContain('itemtype="https://schema.org/FAQPage"')
    expect(post?.content).toContain('₹')
    expect(post?.coverImage).toMatch(/^\/images\/blog\//)
  })

  it('cites live catalog prices', () => {
    const moon = getBlogPost('3d-printed-moon-lamp-india')
    const desk = getBlogPost('3d-printed-desk-organizer-india')
    const planter = getBlogPost('3d-printed-planters-india')
    const dash = getBlogPost('customised-car-dashboard-3d-printed-india')

    expect(moon?.content).toContain(`/products/${product('lamps-lunar-night').id}`)
    expect(moon?.content).toContain('₹1,699')
    expect(product('lamps-lunar-night').price).toBe(1699)

    expect(desk?.content).toContain('₹599')
    expect(product('organizers-desk-pen-holder').price).toBe(599)
    expect(desk?.content).toContain('₹849')
    expect(product('organizers-name-pen-stand').price).toBe(849)

    expect(planter?.content).toContain('₹699')
    expect(product('planters-urban-pot').price).toBe(699)
    expect(planter?.content).toContain('₹3,499')
    expect(product('planters-geo-fern').price).toBe(3499)

    expect(dash?.content).toContain(`/products/${product('pooja-decor-ganesha').id}`)
    expect(product('pooja-decor-ganesha').price).toBe(899)
    expect(product('pooja-decor-trishul').price).toBe(699)
    expect(product('pooja-decor-temple').price).toBe(1499)
  })
})
