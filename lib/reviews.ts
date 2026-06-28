/**
 * Layerix — sample customer reviews.
 *
 * Self-contained; no database dependency.
 * Use getReviewsForProduct(productId) on PDPs and featuredReviews on the homepage.
 */

export interface Review {
  id: string
  productId: string
  author: string
  location: string
  rating: number
  title: string
  body: string
  date: string
  verified: boolean
}

const allReviews: Review[] = [
  // lamps-lamp1 — Rustic Charm Lamp
  {
    id: 'rev-001',
    productId: 'lamps-lamp1',
    author: 'Priya Mehta',
    location: 'Mumbai',
    rating: 5,
    title: 'Exactly what I imagined for my reading corner',
    body: 'Ordered this for my bedroom reading nook and it looks incredible. The warm glow is perfect — not too harsh, not too dim. Build quality is solid and delivery was faster than expected. Will definitely order again.',
    date: '12 Jun 2026',
    verified: true,
  },
  {
    id: 'rev-002',
    productId: 'lamps-lamp1',
    author: 'Arjun Sharma',
    location: 'Delhi',
    rating: 4,
    title: 'Great quality, minor packaging issue',
    body: 'Lamp itself is beautiful and the design is unique. One corner of the box was dented but the product was fine. Love the rustic texture — exactly as shown in the photos.',
    date: '3 Jun 2026',
    verified: true,
  },
  {
    id: 'rev-003',
    productId: 'lamps-lamp1',
    author: 'Sneha Iyer',
    location: 'Bengaluru',
    rating: 5,
    title: 'Gifted this and my friend loved it',
    body: 'Bought as a housewarming gift. My friend was absolutely thrilled — said it tied the whole living room together. The Layerix gift packaging is also a nice touch.',
    date: '28 May 2026',
    verified: true,
  },

  // lamps-lamp2 — Modern Elegance Lamp
  {
    id: 'rev-004',
    productId: 'lamps-lamp2',
    author: 'Rahul Nair',
    location: 'Kochi',
    rating: 5,
    title: 'Stunning centrepiece for my dining table',
    body: 'Put this on our dining table and every guest asks where we got it. The design is minimalist yet eye-catching. Delivery in 3 days — very impressed.',
    date: '10 Jun 2026',
    verified: true,
  },
  {
    id: 'rev-005',
    productId: 'lamps-lamp2',
    author: 'Deepika Rao',
    location: 'Hyderabad',
    rating: 4,
    title: 'Beautiful lamp, wish it came with a bulb',
    body: 'Really happy with the purchase. The finish is smooth and the design is elegant. My only wish was that a compatible bulb was included. Otherwise perfect.',
    date: '5 Jun 2026',
    verified: false,
  },

  // lamps-lamp3 — Contemporary Style Lamp
  {
    id: 'rev-006',
    productId: 'lamps-lamp3',
    author: 'Vikram Joshi',
    location: 'Pune',
    rating: 5,
    title: 'Editor\'s choice is well deserved',
    body: 'Ordered this after seeing the editors choice badge and I understand why. The contemporary design is versatile — looks great in my home office as well as in the living room. Five stars.',
    date: '8 Jun 2026',
    verified: true,
  },
  {
    id: 'rev-007',
    productId: 'lamps-lamp3',
    author: 'Kavya Nambiar',
    location: 'Bengaluru',
    rating: 5,
    title: 'Bought three, one for each room!',
    body: 'I liked it so much after the first order that I bought two more. The quality is consistent across all three. Layerix ships really well — zero damage. Highly recommend.',
    date: '1 Jun 2026',
    verified: true,
  },

  // lamps-lamp5 — Minimalist Modern Lamp
  {
    id: 'rev-008',
    productId: 'lamps-lamp5',
    author: 'Aditya Kulkarni',
    location: 'Chennai',
    rating: 5,
    title: 'Perfect for a minimal home office setup',
    body: 'I have an all-white desk setup and this lamp fits right in. Clean lines, no fuss, and the light output is great for video calls too. Well worth the price.',
    date: '14 Jun 2026',
    verified: true,
  },
  {
    id: 'rev-009',
    productId: 'lamps-lamp5',
    author: 'Meera Pillai',
    location: 'Thiruvananthapuram',
    rating: 4,
    title: 'Very elegant, slightly heavy',
    body: 'The lamp is absolutely gorgeous. I did find it a little heavier than I expected, but the solid feel actually makes it feel premium. Great product overall.',
    date: '9 Jun 2026',
    verified: true,
  },

  // organizers-organizer1
  {
    id: 'rev-010',
    productId: 'organizers-organizer1',
    author: 'Ritu Desai',
    location: 'Ahmedabad',
    rating: 5,
    title: 'Finally my desk looks like the ones on Instagram',
    body: 'I have been struggling to keep my desk tidy. This organizer changed everything. Pens, sticky notes, USB drives — everything has a home now. The design looks expensive but is very reasonably priced.',
    date: '11 Jun 2026',
    verified: true,
  },
  {
    id: 'rev-011',
    productId: 'organizers-organizer1',
    author: 'Siddharth Kapoor',
    location: 'Noida',
    rating: 4,
    title: 'Good quality, wish it had more compartments',
    body: 'Solid build and nice matte finish. Could do with one more compartment for cables but overall a very useful product. Would recommend for small desks.',
    date: '6 Jun 2026',
    verified: true,
  },

  // organizers-organizer3 — TISTWO Tissue Box
  {
    id: 'rev-012',
    productId: 'organizers-organizer3',
    author: 'Ananya Ghosh',
    location: 'Kolkata',
    rating: 5,
    title: 'The magnets are genius!',
    body: 'Who puts magnets in a tissue box holder? Layerix does. I stuck it to my fridge and it has been there for two months, perfectly stable. Such a smart design.',
    date: '7 Jun 2026',
    verified: true,
  },
  {
    id: 'rev-013',
    productId: 'organizers-organizer3',
    author: 'Kiran Nair',
    location: 'Kochi',
    rating: 5,
    title: 'Bought 4 for the whole house',
    body: 'Got one for the kitchen, one for the bathroom, one for my desk, and one for the bedside table. Everyone who visits asks about it. Really happy with this purchase.',
    date: '2 Jun 2026',
    verified: true,
  },

  // planters-planter1 — CACTIA
  {
    id: 'rev-014',
    productId: 'planters-planter1',
    author: 'Pooja Srivastava',
    location: 'Lucknow',
    rating: 5,
    title: 'My cactus looks like it belongs here',
    body: 'Put my little cactus in this planter and the combination is adorable. Great drainage holes, light and sturdy. Also makes a great desk decoration even without a plant.',
    date: '13 Jun 2026',
    verified: true,
  },
  {
    id: 'rev-015',
    productId: 'planters-planter1',
    author: 'Nikhil Reddy',
    location: 'Hyderabad',
    rating: 4,
    title: 'Cute and functional',
    body: 'Nice little planter. The print quality is clean. Drainage is good. Only giving 4 stars because I wish it came in more colour options, but what is available is nice.',
    date: '4 Jun 2026',
    verified: true,
  },

  // planters-planter2 — STEMRA Stackable
  {
    id: 'rev-016',
    productId: 'planters-planter2',
    author: 'Divya Krishnamurthy',
    location: 'Chennai',
    rating: 5,
    title: 'Transformed my balcony into a mini garden',
    body: 'I have six of these stacked up on my small balcony and it is now an actual garden. Each tier is sturdy and self-draining. Customer support was also helpful when I had a question about the hardware.',
    date: '15 Jun 2026',
    verified: true,
  },
  {
    id: 'rev-017',
    productId: 'planters-planter2',
    author: 'Harish Bhat',
    location: 'Mangaluru',
    rating: 5,
    title: 'Perfect herb garden for a small kitchen',
    body: 'Growing basil, mint, and coriander in three tiers. They are all thriving. The interlocking design is very secure — even during the recent storm nothing fell. Brilliant product.',
    date: '11 Jun 2026',
    verified: true,
  },

  // planters-terrace-trio
  {
    id: 'rev-018',
    productId: 'planters-terrace-trio',
    author: 'Sunita Bose',
    location: 'Kolkata',
    rating: 5,
    title: 'Best housewarming gift I could find',
    body: 'Gifted this trio to my cousin and she placed them in a row on her windowsill. They look straight out of a lifestyle magazine. Packaging was excellent and arrived in perfect condition.',
    date: '10 Jun 2026',
    verified: true,
  },
]

/**
 * Returns reviews for a given productId.
 * Defaults to a maximum of 5 reviews per product.
 */
export function getReviewsForProduct(productId: string, limit = 5): Review[] {
  return allReviews.filter((r) => r.productId === productId).slice(0, limit)
}

/**
 * Six featured reviews for the homepage reviews section.
 * Hand-picked for variety of products and strong sentiment.
 */
export const featuredReviews: Review[] = [
  allReviews.find((r) => r.id === 'rev-001')!,
  allReviews.find((r) => r.id === 'rev-016')!,
  allReviews.find((r) => r.id === 'rev-010')!,
  allReviews.find((r) => r.id === 'rev-012')!,
  allReviews.find((r) => r.id === 'rev-008')!,
  allReviews.find((r) => r.id === 'rev-017')!,
]

/**
 * Returns the average rating across all reviews for a product.
 */
export function getAverageRating(productId: string): number {
  const reviews = getReviewsForProduct(productId, Infinity)
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

/**
 * Returns a display-ready aggregate for a product.
 *
 * When detailed reviews exist use them; otherwise fall back to the
 * product.rating / product.reviewCount fields so NO product ever shows
 * a broken/empty reviews block.
 *
 * `productRating` and `productReviewCount` are the values stored in products.json
 * and should always be passed as fallbacks.
 */
export function getReviewAggregate(
  productId: string,
  productRating: number,
  productReviewCount: number,
): { rating: number; count: number; hasDetailedReviews: boolean } {
  const reviews = getReviewsForProduct(productId, Infinity)
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    const avg = Math.round((sum / reviews.length) * 10) / 10
    return { rating: avg, count: reviews.length, hasDetailedReviews: true }
  }
  return { rating: productRating, count: productReviewCount, hasDetailedReviews: false }
}
