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
    id: 'best-seller',
    name: 'Best Seller',
    image: '/images/categories/fantasy-warrior.jpg',
    href: '/products?filter=best-seller',
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    image: '/images/categories/terrain-piece.jpg',
    href: '/products?filter=new-arrivals',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    image: '/images/categories/fantasy-warrior.jpg',
    href: '/products?category=fantasy',
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    image: '/images/categories/sci-fi-mech.jpg',
    href: '/products?category=sci-fi',
  },
  {
    id: 'terrain',
    name: 'Terrain',
    image: '/images/categories/terrain-piece.jpg',
    href: '/products?category=terrain',
  },
  {
    id: 'characters',
    name: 'Characters',
    image: '/images/categories/fantasy-warrior.jpg',
    href: '/products?category=characters',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image: '/images/categories/terrain-piece.jpg',
    href: '/products?category=accessories',
  },
  {
    id: 'custom',
    name: 'Custom Order',
    image: '/images/categories/sci-fi-mech.jpg',
    href: '/custom-order',
  },
]

export function CategoryIcons() {
  return (
    <section className="py-5 bg-[#f7f1e7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="custom-circle-collection">
          <div className="custom-circle-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="custom-circle-item"
              >
                <div className="custom-circle-image-wrapper">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="custom-circle-image"
                    sizes="(max-width: 768px) 120px, 150px"
                  />
                </div>
                <p>{category.name}</p>
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
          gap: 30px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 20px 10px;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
        }

        .custom-circle-grid::-webkit-scrollbar {
          height: 8px;
        }

        .custom-circle-grid:hover::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }

        .custom-circle-grid::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
        }

        .custom-circle-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          transition: transform var(--duration-default) var(--anim-transition);
          flex-shrink: 0;
          scroll-snap-align: start;
          min-width: 120px;
        }

        .custom-circle-item:hover {
          transform: translateY(-5px);
        }

        .custom-circle-image-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: box-shadow var(--duration-default) var(--anim-transition);
        }

        .custom-circle-item:hover .custom-circle-image-wrapper {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .custom-circle-image {
          object-fit: cover;
          transition: transform var(--duration-default) var(--anim-transition);
        }

        .custom-circle-item:hover .custom-circle-image {
          transform: scale(1.05);
        }

        .custom-circle-item p {
          font-family: var(--g-font-2);
          font-size: 14px;
          font-weight: 500;
          color: var(--g-color-heading);
          text-align: center;
          margin: 0;
          transition: color var(--duration-default) var(--anim-transition);
          white-space: nowrap;
        }

        .custom-circle-item:hover p {
          color: var(--g-main-2);
        }

        @media (max-width: 1024px) {
          .custom-circle-grid {
            gap: 24px;
          }

          .custom-circle-item {
            min-width: 100px;
          }

          .custom-circle-image-wrapper {
            width: 100px;
            height: 100px;
          }
        }

        @media (max-width: 768px) {
          .custom-circle-grid {
            gap: 20px;
            padding: 15px 10px;
          }

          .custom-circle-item {
            min-width: 90px;
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
            gap: 15px;
          }

          .custom-circle-item {
            min-width: 80px;
          }

          .custom-circle-image-wrapper {
            width: 80px;
            height: 80px;
          }

          .custom-circle-item p {
            font-size: 11px;
          }
        }
      `}</style>
    </section>
  )
}
