import type { Metadata } from 'next'
import { SITE } from '@/lib/site'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/pricing'

export const metadata: Metadata = {
  title: `Shipping Policy — ${SITE.name}`,
  description: `${SITE.name} shipping coverage, charges, dispatch times, and delivery information for orders across India.`,
}

const LAST_UPDATED = 'June 2025'

export default function ShippingPolicyPage() {
  return (
    <main className="bg-white py-16 px-4">
      <div className="container-page max-w-3xl">
        {/* Page header */}
        <div className="mb-10">
          <span className="inline-block bg-brand/10 text-brand text-xs font-display font-semibold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-4">
            Shipping
          </span>
          <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl leading-tight mb-3">
            Shipping Policy
          </h1>
          <p className="font-sans text-muted text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 font-sans text-ink/80 leading-relaxed">

          {/* Highlight strip */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '📦', label: 'Free Shipping', value: `On orders above ₹${FREE_SHIPPING_THRESHOLD}` },
              { icon: '🚚', label: 'Pan-India Delivery', value: 'All states & union territories' },
              { icon: '⏱️', label: 'Dispatch Time', value: '2–6 business days' },
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
              1. Coverage
            </h2>
            <p>
              We ship to all states and union territories across <strong>India</strong>. Currently,
              we do not offer international shipping, but worldwide shipping for select products is
              planned — stay tuned!
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              2. Shipping Charges
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-brand/5">
                    <th className="text-left p-3 border border-gray-200 font-display font-semibold text-ink">Order Value</th>
                    <th className="text-left p-3 border border-gray-200 font-display font-semibold text-ink">Shipping Charge</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-gray-200">Up to ₹{FREE_SHIPPING_THRESHOLD}</td>
                    <td className="p-3 border border-gray-200 font-medium text-ink">₹{SHIPPING_FEE} flat</td>
                  </tr>
                  <tr className="bg-brand/5">
                    <td className="p-3 border border-gray-200">Above ₹{FREE_SHIPPING_THRESHOLD}</td>
                    <td className="p-3 border border-gray-200 font-semibold text-brand">FREE</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted">
              Shipping charges are calculated at checkout based on your order total before discounts.
              COD (Cash on Delivery) orders may attract an additional nominal COD handling fee.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              3. Processing &amp; Dispatch Times
            </h2>
            <p className="mb-3">
              All {SITE.name} products are <strong>made-to-order</strong> using 3D printing
              technology. Please allow the following timeframes after your order is confirmed:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Standard items:</strong> 2–4 business days for printing, quality
                inspection, and packaging before dispatch.
              </li>
              <li>
                <strong>Custom / personalised items</strong> (keyrings, custom text prints, design
                uploads): 3–6 business days due to the additional design-validation and production
                steps.
              </li>
              <li>
                <strong>Bulk orders (10+ units):</strong> processing times vary — we will confirm
                an estimated timeline at order placement. Contact us on WhatsApp for bulk enquiries.
              </li>
            </ul>
            <p className="mt-3">
              Business days are Monday to Saturday, excluding public holidays. Orders placed on
              Sundays or public holidays are queued for the next business day.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              4. Estimated Delivery Windows
            </h2>
            <p className="mb-3">
              After dispatch, estimated delivery times by region (business days):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-brand/5">
                    <th className="text-left p-3 border border-gray-200 font-display font-semibold text-ink">Region</th>
                    <th className="text-left p-3 border border-gray-200 font-display font-semibold text-ink">Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Agra (local)', '1–2 business days'],
                    ['Uttar Pradesh / NCR (Delhi, Noida, Gurgaon)', '2–3 business days'],
                    ['Metro cities (Mumbai, Bangalore, Chennai, Kolkata, Pune, Hyderabad)', '3–5 business days'],
                    ['Tier-2 cities', '4–6 business days'],
                    ['Remote / rural / North-east India', '5–8 business days'],
                  ].map(([region, eta], i) => (
                    <tr key={region} className={i % 2 === 0 ? '' : 'bg-brand/5'}>
                      <td className="p-3 border border-gray-200">{region}</td>
                      <td className="p-3 border border-gray-200 font-medium text-ink">{eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted">
              Total delivery time = processing time + transit time. These are estimates; actual
              delivery may vary due to courier delays, weather, or local conditions.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              5. Courier Partners
            </h2>
            <p>
              We ship via reputed courier partners including Shiprocket, Delhivery, Bluedart, and
              India Post (for select PIN codes). The courier is chosen based on your PIN code to
              ensure the fastest and most reliable delivery.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              6. Order Tracking
            </h2>
            <p className="mb-3">
              Once your order is dispatched, you will receive:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>An SMS/WhatsApp notification with your tracking number and courier name.</li>
              <li>
                You can also track your order under{' '}
                <a href="/account/track-order" className="text-brand hover:underline">
                  My Account → Track Order
                </a>
                .
              </li>
              <li>
                For assistance, contact us at{' '}
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  WhatsApp
                </a>{' '}
                or{' '}
                <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
                  {SITE.email}
                </a>
                .
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              7. Delivery Attempts &amp; RTO
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Our courier partners typically make up to <strong>3 delivery attempts</strong>. If
                all attempts fail (due to customer unavailability, incorrect address, or refusal
                to accept), the package is returned to us (Return to Origin / RTO).
              </li>
              <li>
                In the event of an RTO due to customer-side reasons, re-dispatch shipping charges
                will apply.
              </li>
              <li>
                For COD orders returned to us due to non-acceptance, the product cost will not be
                refunded; only prepaid orders are eligible for a refund in such circumstances.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              8. Address Accuracy
            </h2>
            <p>
              Please ensure your delivery address is complete and accurate, including flat/house
              number, street name, landmark, city, state, and PIN code. {SITE.name} is not
              responsible for delays or non-delivery caused by incorrect or incomplete addresses
              provided at checkout.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              9. Damaged or Lost Shipments
            </h2>
            <p className="mb-3">
              We pack all orders with care to prevent transit damage. However, if your order
              arrives damaged or is lost:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Report the issue within <strong>48 hours</strong> of delivery by contacting us
                with your order number and a brief <strong>unboxing video</strong> showing the
                damage (this is required to process a claim with the courier).
              </li>
              <li>
                For lost shipments, please allow up to 7 business days after the estimated
                delivery date before raising a &quot;lost in transit&quot; claim.
              </li>
              <li>
                Verified damage/loss claims will be resolved via replacement or refund as per our{' '}
                <a href="/refund-and-returns-policy" className="text-brand hover:underline">
                  Refund &amp; Returns Policy
                </a>
                .
              </li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              10. COD Availability
            </h2>
            <p>
              Cash on Delivery (COD) is available for most PIN codes across India. Availability is
              shown at checkout. COD is <em>not available</em> for orders above ₹5,000 or for
              certain remote PIN codes. A nominal COD handling fee may apply and will be shown
              before you confirm the order.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              11. Sustainable Packaging
            </h2>
            <p>
              We are committed to reducing our environmental footprint. Our packaging uses
              recycled cardboard, minimal plastic, and right-sized boxes to reduce material waste.
              We are continuously working to make our packaging more eco-friendly.
            </p>
          </section>

          {/* Contact box */}
          <section className="bg-surface rounded-card2 p-6 border border-gray-100">
            <h2 className="font-display font-bold text-ink text-xl mb-3">
              Need Help?
            </h2>
            <p className="text-sm mb-4">
              For shipping queries, reach out to our support team:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-medium text-ink">WhatsApp:</span>{' '}
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  {SITE.phone}
                </a>
              </li>
              <li>
                <span className="font-medium text-ink">Email:</span>{' '}
                <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
                  {SITE.email}
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
