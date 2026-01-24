'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface VideoContent {
  id: string
  title: string
  videoUrl: string
  productUrl?: string
}

const videoContent: VideoContent[] = [
  {
    id: 'design',
    title: 'Design Process',
    videoUrl: '/images/watch-shop/design-process.mp4',
    productUrl: '/products/1',
  },
  {
    id: 'printing',
    title: 'Precision Printing',
    videoUrl: '/images/watch-shop/design-process.mp4',
    productUrl: '/products/2',
  },
  {
    id: 'finishing',
    title: 'Hand Finishing',
    videoUrl: '/images/watch-shop/design-process.mp4',
    productUrl: '/products/3',
  },
  {
    id: 'quality',
    title: 'Quality Detail',
    videoUrl: '/images/watch-shop/design-process.mp4',
    productUrl: '/products/4',
  },
]

function VideoItem({ item }: { item: VideoContent }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)

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
        threshold: 0.5, // Play when 50% visible
      }
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [])

  function toggleMute() {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const isVideo = item.videoUrl.endsWith('.mp4')

  return (
    <div className="watch-shop-video-item">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          className="watch-shop-video"
        >
          <source src={item.videoUrl} type="video/mp4" />
        </video>
  
      {/* <button
        onClick={toggleMute}
        className="volume-btn"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button> */}
      {item.productUrl && (
        <Link href={item.productUrl} target="_blank" className="watch-shop-circle-btn" />
      )}
    </div>
  )
}

export function WatchShopSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-5 bg-[#f7f1e7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="watch-shop-headline mb-4">
          <h2 className="text-center">Watch &amp; shop</h2>
        </div>

        <div className="watch-shop-container">
          <div
            ref={scrollContainerRef}
            className="watch-shop-wrapper"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {videoContent.map((item) => (
              <VideoItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .watch-shop-headline h2 {
          text-align: center;
        }

        .watch-shop-wrapper {
          display: flex;
          gap: 8px;
          padding-top: 10px;
          padding-left: 10px;
          padding-right: 10px;
          overflow-x: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        .watch-shop-wrapper::-webkit-scrollbar {
          height: 8px;
        }

        .watch-shop-wrapper:hover::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }

        .watch-shop-wrapper::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
        }

        .watch-shop-video-item {
          flex: 0 0 16%;
          max-width: 16%;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          transition: transform 0.3s ease-in-out;
        }

        .watch-shop-video-item:hover {
          transform: scale(1.05);
        }

        .watch-shop-video {
          height: auto;
          max-height: 500px;
          display: block;
          border-radius: 10px;
          object-fit: cover;
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

        @media (max-width: 1024px) {
          .watch-shop-video-item {
            flex: 0 0 30%;
            max-width: 30%;
          }

          .watch-shop-video {
            max-height: 600px;
          }
        }

        @media (max-width: 768px) {
          .watch-shop-video-item {
            flex: 0 0 45%;
            max-width: 45%;
          }

          .watch-shop-video {
            max-height: 400px;
          }
        }

        @media (max-width: 480px) {
          .watch-shop-video-item {
            flex: 0 0 48%;
            max-width: 48%;
          }

          .watch-shop-video {
            max-height: 300px;
          }
        }
      `}</style>
    </section>
  )
}
