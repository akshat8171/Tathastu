import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Refund & Returns Policy — ${SITE.name}`,
  description: `${SITE.name} returns, refunds, and exchange policy — including custom/personalised items, damage-in-transit, and refund timelines.`,
}

const LAST_UPDATED = 'June 2025'

export default function RefundReturnsPage() {
  return (
    <main className="bg-white py-16 px-4">
      <div className="container-page max-w-3xl">
        {/* Page header */}
        <div className="mb-10">
          <span className="inline-block bg-brand/10 text-brand text-xs font-display font-semibold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-4">
            Returns &amp; Refunds
          </span>
          <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl leading-tight mb-3">
            Refund &amp; Returns Policy
          </h1>
          <p className="font-sans text-muted text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 font-sans text-ink/80 leading-relaxed">

          {/* Intro */}
          <p className="text-lg">
            At <strong className="text-ink">{SITE.name}</strong>, every product is made to order
            with care. Because of the personalised nature of 3D printing, our return policy is
            more limited than traditional retail — but we always make it right when something
            goes wrong on our end.
          </p>

          {/* Key facts strip */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '✅', label: 'Return Window', value: '5 days from delivery' },
              { icon: '⚡', label: 'Decision Timeline', value: '~2 business days' },
              { icon: '💳', label: 'Refund Timeline', value: '5–10 business days' },
            ].map(item => (
              <div key={item.label} className="bg-surface rounded-card2 p-4 text-center border border-gray-100">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-display font-semibold text-ink text-sm mb-1">{item.label}</div>
                <div className="text-muted text-xs">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              1. Non-Returnable Items
            </h2>
            <p className="mb-3">
              The following items <strong>cannot be returned or exchanged</strong> under any
              circumstances, except in the case of a manufacturing defect or damage-in-transit
              (see Section 3):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All <strong>made-to-order products</strong> (our entire product range is made-to-order).</li>
              <li><strong>Custom / personalised items</strong> — keyrings with custom text, products with uploaded designs, colour-customised orders.</li>
              <li>Items that have been used, assembled, or altered after delivery.</li>
              <li>Items returned without original packaging.</li>
              <li>Perishable or hygiene-sensitive items (not applicable to our current catalogue).</li>
            </ul>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              <strong>Note:</strong> Because all {SITE.name} products are manufactured on demand
              specifically for you, we are unable to accept returns for change of mind or
              incorrect size/colour selection (please check product descriptions and size guides
              carefully before ordering).
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              2. Eligible Returns
            </h2>
            <p className="mb-3">
              You may raise a return/refund request within <strong>5 days of delivery</strong> if:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The product has a <strong>manufacturing defect</strong> (e.g., broken print,
                layer delamination, significant warping beyond tolerance).
              </li>
              <li>
                The product was <strong>damaged in transit</strong> (see Section 3 for the
                procedure).
              </li>
              <li>
                You received the <strong>wrong item</strong> — a different product or colour than
                what you ordered.
              </li>
            </ul>
            <p className="mt-3">
              For defective or wrong items, we will arrange a <strong>free return pickup</strong>{' '}
              or ask you to ship it back (shipping costs reimbursed). Once received and inspected,
              we will issue a replacement or a full refund at your choice.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              3. Damage in Transit
            </h2>
            <p className="mb-3">
              If your order arrives visibly damaged:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong>Record an unboxing video</strong> before fully opening the package. This
                is required to support a courier damage claim and our internal quality review.
              </li>
              <li>
                Contact us within <strong>48 hours of delivery</strong> (not later — courier
                claims have strict windows).
              </li>
              <li>
                Send us the unboxing video + photos of the damaged item and packaging to{' '}
                <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
                  {SITE.email}
                </a>{' '}
                or via WhatsApp at{' '}
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  {SITE.phone}
                </a>
                .
              </li>
              <li>
                We will review and respond within 2 business days with a resolution (replacement
                dispatch or refund).
              </li>
            </ol>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              4. How to Raise a Return Request
            </h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Log in to your account and go to{' '}
                <a href="/account/track-order" className="text-brand hover:underline">
                  My Account → Track Order
                </a>
                , then select the relevant order and click &quot;Request Return&quot;.
              </li>
              <li>
                Alternatively, email us at{' '}
                <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
                  {SITE.email}
                </a>{' '}
                with subject: <code className="bg-gray-100 px-1 rounded text-sm">Return Request – Order #[your order number]</code>.
              </li>
              <li>
                Include photos/video of the issue, your order number, and a brief description of
                the problem.
              </li>
              <li>
                Our team will respond within <strong>2 business days</strong> with the next steps.
              </li>
            </ol>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              5. Return Shipping &amp; Condition Requirements
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Items approved for return must be sent in their <strong>original packaging</strong>{' '}
                with all components included.
              </li>
              <li>
                For defective/wrong items, we will arrange a free reverse pickup or reimburse
                reasonable courier charges (up to ₹150 within India).
              </li>
              <li>
                Items must be returned in unused, undamaged condition (except for the reported
                defect/damage) — items showing signs of use or tampering will not be accepted.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              6. Refund Method &amp; Timeline
            </h2>
            <p className="mb-3">
              Approved refunds are processed as follows:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-brand/5">
                    <th className="text-left p-3 border border-gray-200 font-display font-semibold text-ink">Payment Method</th>
                    <th className="text-left p-3 border border-gray-200 font-display font-semibold text-ink">Refund Method</th>
                    <th className="text-left p-3 border border-gray-200 font-display font-semibold text-ink">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Credit / Debit Card', 'Original card (via Razorpay)', '5–10 business days'],
                    ['UPI / Net Banking / Wallet', 'Original source (via Razorpay)', '3–7 business days'],
                    ['Cash on Delivery (COD)', 'Bank transfer (NEFT/IMPS — you provide account details)', '5–10 business days'],
                  ].map(([method, how, eta], i) => (
                    <tr key={method} className={i % 2 === 0 ? '' : 'bg-brand/5'}>
                      <td className="p-3 border border-gray-200">{method}</td>
                      <td className="p-3 border border-gray-200">{how}</td>
                      <td className="p-3 border border-gray-200 font-medium text-ink">{eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted">
              Timelines are from the date we confirm the return/refund, not the date you raise the
              request. Actual bank processing times may vary. Razorpay governs all prepaid refund
              timelines.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              7. Cancellations
            </h2>
            <p>
              For cancellation terms, please refer to our{' '}
              <a href="/terms" className="text-brand hover:underline">
                Terms &amp; Conditions
              </a>{' '}
              (Section 4 — Order Acceptance &amp; Cancellation). In summary, made-to-order items
              can only be cancelled within 2 hours of order placement if printing has not yet
              begun.
            </p>
          </section>

          {/* Contact box */}
          <section className="bg-surface rounded-card2 p-6 border border-gray-100">
            <h2 className="font-display font-bold text-ink text-xl mb-3">
              Contact Us for Returns
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-medium text-ink">Email:</span>{' '}
                <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
                  {SITE.email}
                </a>
              </li>
              <li>
                <span className="font-medium text-ink">WhatsApp:</span>{' '}
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  {SITE.phone}
                </a>
              </li>
              <li>
                <span className="font-medium text-ink">Hours:</span>{' '}
                <span className="text-muted">{SITE.supportHours}</span>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  )
}
