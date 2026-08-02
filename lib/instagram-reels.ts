/**
 * Curated Instagram Reels for the homepage marquee + in-page embed player.
 *
 * Instagram CDN thumbnail URLs expire and often 403 when hotlinked from a
 * third-party site. We therefore:
 *  1. Resolve each reel's cover frame from Instagram
 *  2. Save it under public/images/reels/reel-N.jpg
 *  3. Point thumbnail at that local file
 *
 * Playback still uses Instagram's official /embed iframe (real video).
 *
 * To refresh covers: copy new reel links from Instagram, download the cover
 * JPG into public/images/reels/, and update the entries below.
 */

export interface InstagramReel {
  readonly id: string
  /** Instagram media shortcode from /reel/{shortcode}/ */
  readonly shortcode: string
  readonly title: string
  /** Local copy of the Instagram reel cover frame */
  readonly thumbnail: string
}

export const INSTAGRAM_HANDLE = 'tathastukeepsakes' as const

export const INSTAGRAM_PROFILE_URL =
  `https://www.instagram.com/${INSTAGRAM_HANDLE}/` as const

export const INSTAGRAM_REELS: readonly InstagramReel[] = [
  {
    id: '1',
    shortcode: 'Dbf-GcnBa_-',
    title: 'Kids name decor reel',
    thumbnail: '/images/reels/reel-1.jpg',
  },
  {
    id: '2',
    shortcode: 'DbdUkO9BeFB',
    title: 'Custom name keychain reel',
    thumbnail: '/images/reels/reel-2.jpg',
  },
  {
    id: '3',
    shortcode: 'DbaqVLGBeXJ',
    title: 'Workshop process reel',
    thumbnail: '/images/reels/reel-3.jpg',
  },
  {
    id: '4',
    shortcode: 'DbIzZziB-iO',
    title: 'Letter name decor reel',
    thumbnail: '/images/reels/reel-4.jpg',
  },
  {
    id: '5',
    shortcode: 'DbLhwQtBif2',
    title: 'Personalized nameplate reel',
    thumbnail: '/images/reels/reel-5.jpg',
  },
  {
    id: '6',
    shortcode: 'DaDOy7ehb92',
    title: 'Behind the print reel',
    thumbnail: '/images/reels/reel-6.jpg',
  },
] as const

export function getReelPermalink(shortcode: string): string {
  return `https://www.instagram.com/${INSTAGRAM_HANDLE}/reel/${shortcode}/`
}

export function getReelEmbedUrl(shortcode: string): string {
  return `https://www.instagram.com/reel/${shortcode}/embed`
}
