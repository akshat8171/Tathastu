import { TrackOrderForm } from '@/components/account/track-order-form'

/**
 * /account/track-order
 *
 * Server component shell that renders the section heading and subtitle,
 * then delegates the interactive form to the 'use client' TrackOrderForm.
 *
 * The shared account layout (app/account/layout.tsx) provides the profile
 * header, sidebar, and requireAuth() gate — this page renders only the
 * right-hand content column.
 */
export default function TrackOrderPage() {
  return (
    <div>
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-ink text-2xl">Track your order</h2>
        <p className="font-sans text-muted text-sm mt-1">
          Enter your order number and the email you used at checkout to see its status.
        </p>
      </div>

      {/* Interactive form */}
      <TrackOrderForm />
    </div>
  )
}
