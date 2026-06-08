const reviews = [
  { name: 'Rahul K.', rating: 5, text: 'The dragon miniature is insanely detailed. Paint holds beautifully.', product: 'Ancient Dragon Miniature' },
  { name: 'Priya S.', rating: 5, text: 'Custom lamp for my mom was perfect. Delivered in 4 days!', product: 'Moon Lithophane Lamp' },
  { name: 'Arjun M.', rating: 4, text: 'Great quality terrain pieces. Our DnD group loves them.', product: 'Ruined Castle Terrain' },
]

export function ReviewsSection() {
  return (
    <section className="py-16 sm:py-24 bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-12">
          What <span className="gradient-text">Printers</span> Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="card p-6">
              <div className="text-yellow-400 mb-3">{'★'.repeat(review.rating)}</div>
              <p className="text-gray-300 mb-4 italic">&ldquo;{review.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{review.name}</span>
                <span className="text-xs text-gray-500">{review.product}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
