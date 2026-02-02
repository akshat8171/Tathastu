'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'

interface VideoContent {
  id: string
  title: string
  videoUrl: string
  productUrl?: string
}

const videoContent: VideoContent[] = [
  {
    id: 'Tissue Roller',
    title: 'Tissue Roller',
    videoUrl: '/images/watch-shop/tissue-roller-design.mp4',
    productUrl: '/products/2',
  },
  {
    id: 'Flower Base',
    title: 'Flower Base',
    videoUrl: '/images/watch-shop/flower-base-design.mp4',
    productUrl: '/products/3',
  },
  {
    id: 'JBL Cover',
    title: 'JBL Cover',
    videoUrl: '/images/watch-shop/jbl-cover.mp4',
    productUrl: '/products/4',
  },
  {
    id: 'Lamps',
    title: 'Lamps',
    videoUrl: '/images/watch-shop/lamps-design.mp4',
    productUrl: '/products/1',
  },
  {
    id: 'Toilet Organizer',
    title: 'Toilet Organizer',
    videoUrl: '/images/watch-shop/Toilet-organizer.mp4',
    productUrl: '/products/4',
  }
]

function VideoItem({ item }: { item: VideoContent }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay failed, user interaction required
            })
          } else {
            video.pause()
          }
        })
      },
      {
        threshold: 0.5,
      }
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="watch-shop-video-item">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="watch-shop-video"
      >
        <source src={item.videoUrl} type="video/mp4" />
      </video>
      {item.productUrl && (
        <Link href={item.productUrl} target="_blank" className="watch-shop-circle-btn" />
      )}
    </div>
  )
}

export function WatchShopSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="watch-shop-section">
      <div className="watch-shop-content">
        <div className="watch-shop-headline">
          <h2>Watch &amp; shop</h2>
        </div>

        <div className="watch-shop-wrapper" ref={scrollContainerRef}>
          {videoContent.map((item) => (
            <VideoItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .watch-shop-section {
          background: #f7f1e7;
          padding: 1rem 0;
          width: 100%;
          overflow-x: hidden;
        }

        .watch-shop-content {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
        }

        .watch-shop-headline {
          text-align: center;
          padding: 0 1rem 1rem;
        }

        @media (min-width: 640px) {
          .watch-shop-headline {
            padding: 0 1rem 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .watch-shop-headline {
            padding: 0 2rem 2rem;
          }
        }


        .watch-shop-wrapper {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 1rem 0;
          width: 100%;
        }

        .watch-shop-wrapper::-webkit-scrollbar {
          display: none;
        }

        /* Mobile: Start from edge, add padding at end */
        .watch-shop-wrapper {
          padding-left: 2.5rem;
          padding-right: 1rem;
        }

        @media (min-width: 640px) {
          .watch-shop-wrapper {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .watch-shop-wrapper {
            padding-left: 2rem;
            padding-right: 2rem;
            justify-content: center;
          }
        }

        .watch-shop-video-item {
          flex: 0 0 auto;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          transition: transform 0.3s ease-in-out;
          min-width: 0;
        }

        .watch-shop-video-item:hover {
          transform: scale(1.05);
        }

        /* Mobile: 48% width */
        .watch-shop-video-item {
          width: 48%;
          max-width: 48%;
        }

        /* Tablet: 30% width */
        @media (min-width: 481px) {
          .watch-shop-video-item {
            width: 30%;
            max-width: 30%;
          }
        }

        /* Desktop: 16% width */
        @media (min-width: 1025px) {
          .watch-shop-video-item {
            width: 16%;
            max-width: 16%;
          }
        }

        .watch-shop-video {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 10px;
          object-fit: cover;
          max-height: 300px;
        }

        @media (min-width: 481px) {
          .watch-shop-video {
            max-height: 400px;
          }
        }

        @media (min-width: 769px) {
          .watch-shop-video {
            max-height: 500px;
          }
        }

        @media (min-width: 1025px) {
          .watch-shop-video {
            max-height: 600px;
          }
        }

        .watch-shop-circle-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
          background-color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
          z-index: 2;
        }

        .watch-shop-circle-btn::before {
          content: '+';
          font-size: 18px;
          color: #000000;
          line-height: 1;
        }

        .watch-shop-circle-btn:hover {
          transform: scale(1.2);
        }
      `}</style>
    </section>
  )
}
