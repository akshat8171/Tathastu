/**
 * Curated Instagram Reels for the homepage marquee + in-page embed player.
 *
 * Instagram does not allow hotlinking CDN video or stable public thumbnails
 * without Graph API auth. We store real reel shortcodes (permalinks) and
 * local cover images. Playback uses Instagram's official /embed iframe.
 *
 * To refresh the list: open Instagram → Copy link on each Reel → paste the
 * shortcode below and drop a matching cover under public/images/reels/.
 */

export interface InstagramReel {
  readonly id: string
  /** Instagram media shortcode from /reel/{shortcode}/ */
  readonly shortcode: string
  readonly title: string
  /** Local cover image — Instagram CDN thumbs expire / block hotlinking */
  readonly thumbnail: string
}

export const INSTAGRAM_HANDLE = 'tathastukeepsakes' as const

export const INSTAGRAM_PROFILE_URL =
  `https://www.instagram.com/${INSTAGRAM_HANDLE}/` as const

export const INSTAGRAM_REELS: readonly InstagramReel[] = [
  {
    id: '1',
    shortcode: 'DZfYs2-hS2C',
    title: 'Custom keepsake reel',
    thumbnail: '/images/3dps/products/key-01.png',
  },
  {
    id: '2',
    shortcode: 'DZSXxgUBNc_',
    title: 'Home decor reel',
    thumbnail: '/images/3dps/products/decor-01.jpg',
  },
  {
    id: '3',
    shortcode: 'DbIzZziB-iO',
    title: 'Pooja decor reel',
    thumbnail: '/images/3dps/products/pooja-01.png',
  },
] as const

export function getReelPermalink(shortcode: string): string {
  return `https://www.instagram.com/${INSTAGRAM_HANDLE}/reel/${shortcode}/`
}

export function getReelEmbedUrl(shortcode: string): string {
  return `https://www.instagram.com/reel/${shortcode}/embed`
}
