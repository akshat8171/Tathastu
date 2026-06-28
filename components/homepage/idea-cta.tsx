import { Button } from '@/components/ui'

export function IdeaCta() {
  return (
    <section className="py-14 sm:py-20 bg-ink relative overflow-hidden" aria-label="Custom print enquiry">
      {/* Decorative background circles */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-violet/20 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-brand/20 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="container-page relative z-10 text-center">
        {/* Eyebrow */}
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-white/60 mb-4">
          Custom 3D Printing
        </p>

        {/* Headline */}
        <h2 className="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4 max-w-2xl mx-auto">
          Have an idea?{' '}
          <span className="text-brand">
            We&apos;ll print it.
          </span>
        </h2>

        {/* Sub-copy */}
        <p className="font-sans text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Upload a file, describe what you need, or drop us a message — we&apos;ll
          turn your idea into a physical object, shipped anywhere in India.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" href="/customize">
            Customise Now
          </Button>
          <a
            href="https://wa.me/919154892790"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-base px-8 py-4 inline-flex items-center justify-center gap-2 border-white/40 text-white hover:bg-white/10"
            aria-label="Chat on WhatsApp"
          >
            {/* WhatsApp icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
