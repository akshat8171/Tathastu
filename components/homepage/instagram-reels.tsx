'use client'

/**
 * InstagramReels — marquee carousel of Instagram reel thumbnails
 *
 * Displays a continuous right-to-left scrolling marquee of Instagram reel
 * thumbnails. Each thumbnail links to the actual reel on Instagram.
 * The marquee pauses on hover.
 *
 * Since Instagram Graph API requires authentication, we hardcode a list
 * of reel URLs and use placeholder thumbnail images.
 */

import Link from 'next/link'
import Image from 'next/image'

interface Reel {
  id: string
  url: string
  thumbnail: string
}

// Hardcoded list of Instagram reels from @tathastukeepsakes.in
// Thumbnails use placeholder SVGs — replace with actual reel screenshots when available
const REELS: Reel[] = [
  { id: '1', url: 'https://www.instagram.com/tathastukeepsakes.in/', thumbnail: '/images/reels/reel-1.svg' },
  { id: '2', url: 'https://www.instagram.com/tathastukeepsakes.in/', thumbnail: '/images/reels/reel-2.svg' },
  { id: '3', url: 'https://www.instagram.com/tathastukeepsakes.in/', thumbnail: '/images/reels/reel-3.svg' },
  { id: '4', url: 'https://www.instagram.com/tathastukeepsakes.in/', thumbnail: '/images/reels/reel-4.svg' },
  { id: '5', url: 'https://www.instagram.com/tathastukeepsakes.in/', thumbnail: '/images/reels/reel-5.svg' },
  { id: '6', url: 'https://www.instagram.com/tathastukeepsakes.in/', thumbnail: '/images/reels/reel-6.svg' },
  { id: '7', url: 'https://www.instagram.com/tathastukeepsakes.in/', thumbnail: '/images/reels/reel-7.svg' },
  { id: '8', url: 'https://www.instagram.com/tathastukeepsakes.in/', thumbnail: '/images/reels/reel-8.svg' },
  { id: '9', url: 'https://www.instagram.com/tathastukeepsakes.in/', thumbnail: '/images/reels/reel-9.svg' },
  { id: '10', url: 'https://www.instagram.com/tathastukeepsakes.in/', thumbnail: '/images/reels/reel-10.svg' },
]

export function InstagramReels() {
  // Duplicate reels for seamless infinite scroll
  const duplicatedReels = [...REELS, ...REELS]

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white" aria-label="Instagram Reels">
      <div className="container-page">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Follow us on Instagram
          </h2>
          <Link
            href="https://www.instagram.com/tathastukeepsakes.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 transition-colors"
          >
            @tathastukeepsakes.in
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* Marquee container */}
        <div className="relative overflow-hidden">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Marquee track */}
          <div className="group flex hover:cursor-pointer">
            <div className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused]">
              {duplicatedReels.map((reel, index) => (
                <Link
                  key={`${reel.id}-${index}`}
                  href={reel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 group/card"
                >
                  <div className="relative w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                    {/* Thumbnail image */}
                    <Image
                      src={reel.thumbnail}
                      alt={`Instagram reel ${reel.id}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 120px, 150px"
                    />

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 group-hover/card:bg-white flex items-center justify-center shadow-lg transition-all duration-300 group-hover/card:scale-110">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-brand ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Instagram logo corner badge */}
                    <div className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  )
}
