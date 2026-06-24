import { SectionHeading } from '@/components/ui'
import { Button } from '@/components/ui'

const values = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Precision',
    body: 'We never compromise on print quality or the materials we use. Every layer counts.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'Craftsmanship',
    body: 'Every piece is hand-finished and inspected before shipping. We take pride in the details.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Community',
    body: 'We\'re makers and creators ourselves — we understand what you need and why it matters.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Custom First',
    body: 'Your imagination is the only limit. We print what you dream, in any colour, at any scale.',
  },
]

const stats = [
  { number: '5,000+', label: 'Happy customers' },
  { number: '24', label: 'Hours avg. response' },
  { number: '99%', label: 'Satisfaction rate' },
  { number: '500+', label: 'Unique designs printed' },
]

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet/10 via-surface to-white py-20 px-4">
        <div className="container-page text-center">
          <span className="inline-block bg-brand/10 text-brand text-xs font-display font-semibold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-6">
            Our Story
          </span>
          <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
            About{' '}
            <span className="text-brand">Tathastu</span>
          </h1>
          <p className="font-sans text-muted text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            We believe 3D printing is more than just technology — it&apos;s an art form. Every lamp,
            planter, and organiser we create is designed to be a centrepiece, a conversation starter,
            and a work of art.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" href="/products" size="lg">
              Shop Now
            </Button>
            <Button variant="outline" href="/customize" size="lg">
              Get a Custom Print
            </Button>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-brand py-12 px-4">
        <div className="container-page">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center text-white">
            {stats.map(s => (
              <div key={s.label}>
                <div className="font-display font-extrabold text-3xl sm:text-4xl mb-1">{s.number}</div>
                <div className="font-sans text-white/80 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-white">
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeading
              title="Our Mission"
              subtitle="If it exists, we can print it."
              centered
            />
            <p className="font-sans text-muted text-lg leading-relaxed mt-6">
              Layer by layer, we bring imagination to life using cutting-edge 3D printing technology
              combined with hand-finishing by skilled artisans. From beautifully crafted lamps and
              desk organisers to custom planters shipped across India — Tathastu is where ideas
              become objects.
            </p>
            <p className="font-sans text-muted text-lg leading-relaxed mt-4">
              We serve homemakers, interior designers, cafés, corporate gifting teams, and everyone
              in between. Whether it&apos;s a single piece or a bulk order, we treat every print with
              the same care and precision.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-surface">
        <div className="container-page">
          <SectionHeading
            title="Our Values"
            subtitle="The principles that guide everything we make."
            centered
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {values.map(v => (
              <div key={v.title} className="card p-6 text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 text-brand mb-4 group-hover:bg-brand group-hover:text-white transition-colors duration-200">
                  {v.icon}
                </div>
                <h3 className="font-display font-semibold text-ink text-lg mb-2">{v.title}</h3>
                <p className="font-sans text-muted text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-20 px-4 bg-ink text-white text-center">
        <div className="container-page max-w-2xl">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Have an idea? We&apos;ll print it.
          </h2>
          <p className="font-sans text-white/70 text-lg mb-8">
            Upload your design or just describe what you need — we&apos;ll quote, print, and ship it
            anywhere in India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" href="/customize" size="lg">
              Start Customising
            </Button>
            <Button
              variant="outline"
              href="https://wa.me/918882065253"
              size="lg"
            >
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
