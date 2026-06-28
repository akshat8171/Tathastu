/**
 * Photo Upload Section — Homepage
 *
 * Two side-by-side CTA cards that invite customers to turn their favourite
 * photo into a physical 3D-printed object:
 *   • Photo → Custom Keychain  (/customize?type=keychain)
 *   • Photo → Portrait / Lithophane  (/customize?type=portrait)
 *
 * Stateless server component — no client JS needed.
 */

import Link from 'next/link'
import { Button } from '@/components/ui'

// WhatsApp SVG icon (inline — avoids an image import for a tiny path)
function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// Camera / upload icon
function CameraIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

// Portrait / lithophane icon (person outline)
function PortraitIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="12" cy="9" r="3" />
      <path d="M6 21v-1a6 6 0 0 1 12 0v1" />
    </svg>
  )
}

interface CardProps {
  icon: React.ReactNode
  eyebrow: string
  title: string
  body: string
  primaryLabel: string
  primaryHref: string
  badge?: string
  accentClass: string       // tailwind text colour for icon + border accent
  bgAccentClass: string     // tailwind bg colour for icon wrapper
}

function PhotoCard({
  icon,
  eyebrow,
  title,
  body,
  primaryLabel,
  primaryHref,
  badge,
  accentClass,
  bgAccentClass,
}: CardProps) {
  return (
    <Link
      href={primaryHref}
      className="group relative block rounded-card2 bg-white border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
      aria-label={`${title} — ${primaryLabel}`}
    >
      {/* Subtle hover-reveal top border accent */}
      <div
        className={`absolute inset-x-0 top-0 h-1 ${bgAccentClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        aria-hidden="true"
      />

      <div className="p-6 sm:p-8 flex flex-col gap-5 h-full">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-xl ${bgAccentClass} ${accentClass} flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>

        {/* Copy */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Eyebrow + optional badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-xs font-display font-semibold uppercase tracking-widest ${accentClass}`}>
              {eyebrow}
            </p>
            {badge && (
              <span className="text-[10px] font-display font-bold uppercase tracking-wide bg-brand text-white px-2 py-0.5 rounded-full leading-none">
                {badge}
              </span>
            )}
          </div>

          <h3 className="font-display font-extrabold text-ink text-xl sm:text-2xl leading-tight">
            {title}
          </h3>

          <p className="font-sans text-muted text-sm leading-relaxed">
            {body}
          </p>
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
          <span className="btn-primary text-sm px-6 py-3 group-hover:bg-brand-600">
            {primaryLabel}
          </span>
          <span className={`font-sans text-xs ${accentClass} flex items-center gap-1.5`}>
            <WhatsAppIcon />
            Chat to discuss
          </span>
        </div>
      </div>
    </Link>
  )
}

export function PhotoUploadSection() {
  return (
    <section
      className="py-14 sm:py-20 bg-surface"
      aria-label="Turn your photo into a 3D print"
    >
      <div className="container-page">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-brand mb-2">
            Photo to Product
          </p>
          <h2 className="font-display font-extrabold text-ink text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3">
            Upload your image.{' '}
            <span className="text-brand">We&apos;ll print it.</span>
          </h2>
          <p className="font-sans text-muted text-base max-w-lg mx-auto leading-relaxed">
            Send us a photo — we&apos;ll turn it into a vivid 3D-printed keychain or
            a stunning lithophane portrait. Every piece is hand-finished and shipped
            across India.
          </p>
        </div>

        {/* Dual cards */}
        <div className="grid sm:grid-cols-2 gap-5 lg:gap-7 max-w-3xl mx-auto">
          <PhotoCard
            icon={<CameraIcon />}
            eyebrow="Photo Keychains"
            title="Your photo, on a keychain"
            body={
              "Upload any portrait or moment — we’ll sculpt it into a multi-colour " +
              "PLA+ keychain you’ll carry everywhere. Perfect for gifts, pets & memories."
            }
            primaryLabel="Make my keychain"
            primaryHref="/customize?type=keychain"
            badge="Bestseller"
            accentClass="text-brand"
            bgAccentClass="bg-brand/10"
          />

          <PhotoCard
            icon={<PortraitIcon />}
            eyebrow="Lithophane Portraits"
            title="A portrait that glows"
            body={
              "A lithophane turns your favourite photo into a translucent 3D panel " +
              "that reveals every detail when backlit. A gift unlike anything else."
            }
            primaryLabel="Create my portrait"
            primaryHref="/customize?type=portrait"
            badge="New"
            accentClass="text-violet"
            bgAccentClass="bg-violet/10"
          />
        </div>

        {/* Bottom reassurance line */}
        <p className="text-center font-sans text-muted text-xs mt-8">
          All custom orders dispatched in 3–5 business days &middot; Shipped pan-India &middot; Satisfaction guaranteed
        </p>
      </div>
    </section>
  )
}
