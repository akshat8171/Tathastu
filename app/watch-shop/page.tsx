'use client'

import Image from 'next/image'
import Link from 'next/link'

const processSteps = [
  {
    id: 'design',
    title: 'Design & Modeling',
    image: '/images/watch-shop/design-process.mp4',
    isVideo: true,
    description:
      'Every miniature starts with careful design and 3D modeling. Our artists create detailed digital models optimized for 3D printing.',
  },
  {
    id: 'printing',
    title: 'Precision Printing',
    image: '/images/watch-shop/printer-nozzle.jpg',
    isVideo: false,
    description:
      'Watch our 3D printers create layer by layer with extreme precision. We use high-resolution resin printing for incredible detail.',
  },
  {
    id: 'finishing',
    title: 'Hand Finishing',
    image: '/images/watch-shop/removing-supports.jpg',
    isVideo: false,
    description:
      'Careful removal of supports and hand-finishing ensures every piece is perfect. Our artisans inspect and refine each miniature.',
  },
  {
    id: 'quality',
    title: 'Quality Control',
    image: '/images/watch-shop/texture-closeup.jpg',
    isVideo: false,
    description:
      'Macro shots showcase the incredible texture and resolution. Every detail is checked before shipping.',
  },
]

export default function WatchShopPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-ink mb-6">
            WATCH &amp; SHOP
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            See our process and build trust in the quality of every print. From
            design to delivery, we&apos;re transparent about how we create your
            miniatures.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {processSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } gap-8 items-center`}
              >
                <div className="relative w-full md:w-1/2 aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
                  {step.isVideo ? (
                    <video
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={step.image} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display text-4xl font-bold text-brand">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="font-display text-3xl font-bold text-ink">
                      {step.title}
                    </h2>
                  </div>
                  <p className="text-lg text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-bold text-ink mb-6">
            Ready to Start Your Collection?
          </h2>
          <p className="text-lg text-muted mb-8">
            Browse our collection of premium 3D printed miniatures and find the
            perfect pieces for your tabletop adventures.
          </p>
          <Link
            href="/products"
            className="inline-block bg-brand hover:bg-brand-600 text-white px-8 py-4 rounded-pill font-display font-semibold text-lg transition-colors"
          >
            SHOP NOW
          </Link>
        </div>
      </section>
    </div>
  )
}
