const reviews = [
  { name: 'Nisha Agarwal, Mumbai', rating: 5, text: 'The 3D printed lamp is stunning. The detail and finish quality exceeded my expectations. Fast delivery too!' },
  { name: 'Rahul K., Delhi', rating: 5, text: 'The dragon miniature is insanely detailed. Paint holds beautifully. Will order more for our DnD group.' },
  { name: 'Priya S., Bangalore', rating: 5, text: 'Custom name sign for my daughter\'s room was perfect. Great communication and delivered on time.' },
]

export function ReviewsSection() {
  return (
    <section className="py-16 sm:py-20 bg-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sage-green text-sm font-semibold uppercase tracking-widest text-center mb-2">
          Hear From Our Happy Clients
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal text-center mb-12">
          Reviews
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="card p-6">
              <div className="font-bold text-sm text-charcoal mb-1">{review.name}</div>
              <div className="text-sage-green text-lg mb-3">{'★'.repeat(review.rating)}</div>
              <p className="text-charcoal-light text-sm leading-relaxed italic">
                &ldquo;{review.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
