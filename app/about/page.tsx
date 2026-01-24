import { BrandStory } from '@/components/about/brand-story'
import { MeetFounder } from '@/components/about/meet-founder'

export default function AboutPage() {
  return (
    <div className="bg-cream min-h-screen">
      <BrandStory />
      <MeetFounder />
      
      {/* Additional About Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-lg leading-relaxed text-charcoal/80">
            <h2 className="font-serif text-4xl font-bold text-charcoal mb-6">
              Our Mission
            </h2>
            <p>
              We believe that tabletop gaming is more than just a hobby—it's an
              art form. Every miniature we create is designed to be a centerpiece,
              a conversation starter, and a work of art that enhances your gaming
              experience.
            </p>
            <p>
              Our commitment to quality means we use only the finest materials and
              most advanced printing technology. Each piece is carefully inspected
              and finished by hand to ensure it meets our exacting standards.
            </p>
            <h2 className="font-serif text-4xl font-bold text-charcoal mt-12 mb-6">
              Our Values
            </h2>
            <ul className="space-y-4 list-disc list-inside">
              <li>
                <strong>Quality First:</strong> We never compromise on the quality
                of our prints or the materials we use.
              </li>
              <li>
                <strong>Artisan Craftsmanship:</strong> Every piece is treated as
                a work of art, not just a product.
              </li>
              <li>
                <strong>Community Focus:</strong> We're gamers and painters ourselves,
                and we understand what you need.
              </li>
              <li>
                <strong>Sustainability:</strong> We're committed to responsible
                manufacturing and packaging practices.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
