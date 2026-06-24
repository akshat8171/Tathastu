import Link from 'next/link'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  viewAllHref?: string
  viewAllLabel?: string
  className?: string
  centered?: boolean
}

export function SectionHeading({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View all',
  className = '',
  centered = false,
}: SectionHeadingProps) {
  return (
    <div className={`mb-6 ${centered ? 'text-center' : ''} ${className}`}>
      <div className={`flex items-start ${centered ? 'justify-center' : 'justify-between'} gap-4`}>
        <div>
          <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted font-sans">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllHref && !centered && (
          <Link
            href={viewAllHref}
            className="section-heading__link mt-1 flex-shrink-0"
            aria-label={`${viewAllLabel} – ${title}`}
          >
            {viewAllLabel} →
          </Link>
        )}
      </div>

      {viewAllHref && centered && (
        <Link
          href={viewAllHref}
          className="section-heading__link mt-3 inline-block"
          aria-label={`${viewAllLabel} – ${title}`}
        >
          {viewAllLabel} →
        </Link>
      )}
    </div>
  )
}
