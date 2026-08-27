import type { HomepageSettings } from './types'

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  sections: {
    hero: true,
    categories: true,
    promo: true,
    bestSellers: true,
    trust: true,
    rails: true,
    reviews: true,
    photoUpload: true,
    ideaCta: true,
    instagram: true,
    newsletter: true,
  },
  heroSlides: [
    {
      eyebrow: 'Pooja & Decor',
      headline: 'Devotion,',
      highlight: 'beautifully printed.',
      subcopy:
        'Intricately detailed idols, diya stands and pooja essentials crafted for your sacred space.',
      ctaLabel: 'Shop Pooja & Decor',
      ctaHref: '/products?category=pooja-decor',
      productIds: [
        'pooja-decor-ganesha',
        'pooja-decor-lakshmi',
        'pooja-decor-krishna',
        'pooja-decor-temple',
      ],
    },
    {
      eyebrow: 'Keyrings & Bag Tags',
      headline: 'Personalised,',
      highlight: 'built to last.',
      subcopy:
        'Name keyrings and bag tags printed in vivid multi-colour — the perfect little everyday statement.',
      ctaLabel: 'Shop Keyrings',
      ctaHref: '/products?category=keyrings',
      productIds: ['keyrings-name', 'keyrings-puppy', 'keyrings-tennis', 'keyrings-shiva'],
    },
    {
      eyebrow: 'Gaming & Fun',
      headline: 'One-of-a-kind,',
      highlight: 'made to order.',
      subcopy:
        'Collectible 3D-printed pieces for fans and gamers — crisp detail, bold colour, endless personality.',
      ctaLabel: 'Shop Gaming',
      ctaHref: '/products?category=gaming',
      productIds: ['gaming-shield', 'gaming-gamepad', 'gaming-toad', 'gaming-question'],
    },
  ],
  bestSellerIds: [
    'keyrings-name',
    'pooja-decor-ganesha',
    'gaming-shield',
    'keyrings-puppy',
    'pooja-decor-shiva',
    'pooja-decor-temple',
    'keyrings-shiva',
    'gaming-toad',
    'lamps-lunar-night',
    'planters-terrace-trio',
  ],
  promo: {
    enabled: true,
    headline: '20% OFF your first order',
    subcopy: 'One-time use · Min order ₹199 · Free shipping on orders over ₹199',
    code: 'FIRST20',
  },
  categoryRails: [
    {
      slug: 'keyrings',
      title: 'Keyrings & Bag Tags',
      subtitle: 'Personalised, multi-colour and built to last.',
    },
    {
      slug: 'pooja-decor',
      title: 'Pooja & Decor',
      subtitle: 'Devotional pieces, beautifully printed.',
    },
    {
      slug: 'gaming',
      title: 'Gaming & Fun',
      subtitle: 'One-of-a-kind, made-to-order creations.',
    },
    {
      slug: 'lamps',
      title: 'Lamps & Lighting',
      subtitle: 'Statement pieces that cast the perfect glow.',
    },
    {
      slug: 'planters',
      title: 'Planters & Garden',
      subtitle: 'Unique planters for succulents, herbs, and house plants.',
    },
  ],
}

export const HOMEPAGE_SECTION_LABELS: Record<keyof HomepageSettings['sections'], string> = {
  hero: 'Hero carousel',
  categories: 'Shop by category',
  promo: 'Promo strip',
  bestSellers: 'Best sellers',
  trust: 'Trust band',
  rails: 'Category product rails',
  reviews: 'Customer reviews',
  photoUpload: 'Photo upload / custom',
  ideaCta: 'Idea / custom CTA',
  instagram: 'Instagram reels',
  newsletter: 'Newsletter',
}
