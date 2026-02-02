'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  image: string
  href: string
}

const categories: Category[] = [
  {
    id: 'lamps',
    name: 'Lamps',
    image: '/images/categories/lamps.jpg',
    href: '/products?category=lamps',
  },
  {
    id: 'organizers',
    name: 'Organizers',
    image: '/images/categories/organizer.jpg',
    href: '/products?category=organizers',
  },
  {
    id: 'planters',
    name: 'Planters',
    image: '/images/categories/planter.jpg',
    href: '/products?category=planters',
  },
  {
    id: 'keychains',
    name: 'Keychains',
    image: '/images/categories/keychains.jpg',
    href: '/products?category=keychains',
  },
  {
    id: 'customized-signs',
    name: 'Customized Signs',
    image: '/images/categories/customized-signs.jpg',
    href: '/products?category=customized-signs',
  },
  {
    id: 'customized-miniatures',
    name: 'Customized Miniatures',
    image: '/images/categories/miniatures.jpg',
    href: '/products?category=customized-miniatures',
  },
]

export function CategoryIcons() {
  return (
    <section className="py-5 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="custom-circle-collection">
          <div className="custom-circle-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="custom-circle-item"
              >
                <div 
                  className="custom-circle-image-wrapper"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="custom-circle-image"
                    sizes="(max-width: 768px) 90px, (max-width: 1024px) 100px, 120px"
                    style={{
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <p style={{ textAlign: 'center' }}>{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-circle-collection {
          width: 100%;
        }

        .custom-circle-grid {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 16px 24px;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
          justify-content: flex-start;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (min-width: 1200px) {
          .custom-circle-grid {
            justify-content: center;
          }
        }

        .custom-circle-grid::-webkit-scrollbar {
          display: none;
        }

        .custom-circle-item {
          justify-content: flex-start;
          text-decoration: none;
          transition: transform var(--duration-default) var(--anim-transition);
          scroll-snap-align: start;
          width: 120px;
          text-align: center;
        }

        .custom-circle-item:hover {
          transform: translateY(-5px);
        }

        .custom-circle-image-wrapper {
          position: relative !important;
          width: 120px !important;
          height: 120px !important;
          border-radius: 50%;
          overflow: hidden !important;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: box-shadow var(--duration-default) var(--anim-transition);
          flex-shrink: 0;
          max-width: 120px !important;
          max-height: 120px !important;
        }

        .custom-circle-item:hover .custom-circle-image-wrapper {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .custom-circle-image {
          object-fit: cover !important;
          transition: transform var(--duration-default) var(--anim-transition);
        }
        
        .custom-circle-image-wrapper img,
        .custom-circle-image-wrapper span,
        .custom-circle-image-wrapper span img {
          // max-width: 100% !important;
          // max-height: 100% !important;
          width: auto !important;
          height: auto !important;
        }

        .custom-circle-item:hover .custom-circle-image {
          transform: scale(1.05);
        }

        .custom-circle-item p {
          font-family: var(--g-font-2);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--g-color-heading);
          text-align: center;
          margin: 0;
          transition: color var(--duration-default) var(--anim-transition);
          /* Override global p styles that affect alignment */
          text-transform: none !important;
          letter-spacing: normal !important;
          line-height: 1.3 !important;
        }

        .custom-circle-item:hover p {
          color: var(--g-main-2);
        }

        @media (max-width: 1024px) {
          .custom-circle-grid {
            gap: 24px;
            justify-content: flex-start;
          }

          .custom-circle-item {
            width: 100px;
            text-align: center;
          }

          .custom-circle-image-wrapper {
            width: 100px;
            height: 100px;
          }

        }

        @media (max-width: 768px) {
          .custom-circle-grid {
            gap: 20px;
            padding: 25px 10px;
            justify-content: flex-start;
          }

          .custom-circle-item {
            width: 10px;
            text-align: center;
          }

          .custom-circle-image-wrapper {
            width: 90px;
            height: 90px;
            margin-bottom: 10px;
          }

          .custom-circle-item p {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .custom-circle-grid {
            gap: 25px;
            padding: 15px 10px;
            justify-content: flex-start;
          }

          .custom-circle-item {
            width: 100px;
            text-align: center;
          }

          .custom-circle-image-wrapper {
            width: 100px;
            height: 100px;
          }

          .custom-circle-item p {
          text-align: center;
            font-size: 0.85rem;
            font-weight: 500;
            margin: 0;
          }
        }
      `}</style>
    </section>
  )
}
