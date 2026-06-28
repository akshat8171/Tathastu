/**
 * lib/site.ts — Single source of truth for Tathastu Keepsakes business identity.
 *
 * FROZEN CONTRACT: imported by footer, announcement-bar, whatsapp-float,
 * content pages, and all other consumers. Never hardcode contact details
 * elsewhere — import from here.
 */

export const SITE = {
  name: 'Tathastu Keepsakes',
  tagline: "India's Premium 3D Printing & Custom Keepsakes Store",
  description:
    'Premium 3D-printed keepsakes, home decor, custom gifts, and personalised prints — crafted layer by layer in Agra and shipped across India.',
  phone: '+91 91548 92790',
  phoneTel: 'tel:+919154892790',
  email: 'tathastukeepsakes@gmail.com',
  whatsapp: 'https://wa.me/919154892790',
  whatsappNumber: '919154892790',
  instagram: 'https://instagram.com/tathastukeepsakes', // placeholder until owner confirms handle
  facebook: 'https://facebook.com/tathastukeepsakes', // placeholder until owner confirms handle
  addressLines: ['Agra, Uttar Pradesh', 'India'],
  supportHours: 'Mon–Sat, 10am–7pm IST',
  copyrightName: 'Tathastu Keepsakes',
} as const

/**
 * Returns a wa.me URL with an optional prefilled message.
 *
 * @example
 * waLink() // https://wa.me/919154892790
 * waLink('Hi, I want to enquire about my order') // ?text=...
 */
export function waLink(text?: string): string {
  if (!text) return SITE.whatsapp
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`
}
