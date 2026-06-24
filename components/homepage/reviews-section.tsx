import { Rating } from '@/components/ui'
import { featuredReviews } from '@/lib/reviews'

export function ReviewsSection() {
  return (
    <section className="py-14 sm:py-20 bg-surface">
      <div className="container-page">
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-brand mb-2">
            Customer Stories
          </p>
          <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl">
            Loved by customers across India
          </h2>
          <p className="font-sans text-muted text-sm mt-2 max-w-sm mx-auto">
            Real orders, real people, real homes.
          </p>
        </div>

        {/* Review cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredReviews.map((review) => (
            <article
              key={review.id}
              className="card p-5 flex flex-col gap-3"
              aria-label={`Review by ${review.author}`}
            >
              {/* Stars */}
              <Rating value={review.rating} />

              {/* Title */}
              <h3 className="font-display font-semibold text-ink text-sm leading-snug">
                {review.title}
              </h3>

              {/* Body */}
              <p className="font-sans text-muted text-sm leading-relaxed flex-1">
                &ldquo;{review.body}&rdquo;
              </p>

              {/* Author line */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <div>
                  <p className="font-display font-semibold text-ink text-xs">{review.author}</p>
                  <p className="font-sans text-muted text-xs">{review.location}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 font-sans text-brand text-xs font-medium">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Verified
                    </span>
                  )}
                  <span className="font-sans text-muted text-xs">{review.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Aggregate stats */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
          <div>
            <p className="font-display font-extrabold text-ink text-3xl">4.7</p>
            <Rating value={4.7} className="justify-center mt-1" />
            <p className="font-sans text-muted text-xs mt-1">Average rating</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-gray-200" />
          <div>
            <p className="font-display font-extrabold text-ink text-3xl">4,200+</p>
            <p className="font-sans text-muted text-xs mt-1">Happy customers</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-gray-200" />
          <div>
            <p className="font-display font-extrabold text-ink text-3xl">98%</p>
            <p className="font-sans text-muted text-xs mt-1">On-time delivery</p>
          </div>
        </div>
      </div>
    </section>
  )
}
