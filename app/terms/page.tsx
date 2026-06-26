import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Terms & Conditions — ${SITE.name}`,
  description: `Terms and Conditions governing orders, payments, custom prints, intellectual property, and use of the ${SITE.name} website.`,
}

const LAST_UPDATED = 'June 2025'

export default function TermsPage() {
  return (
    <main className="bg-white py-16 px-4">
      <div className="container-page max-w-3xl">
        {/* Page header */}
        <div className="mb-10">
          <span className="inline-block bg-brand/10 text-brand text-xs font-display font-semibold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-4">
            Legal
          </span>
          <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl leading-tight mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="font-sans text-muted text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 font-sans text-ink/80 leading-relaxed">

          {/* Intro */}
          <p className="text-lg">
            These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of the
            website <span className="text-brand font-medium">layerix.in</span> and all services
            provided by <strong className="text-ink">{SITE.name}</strong> (&quot;we&quot;,
            &quot;us&quot;, or &quot;our&quot;). By placing an order or using our website, you
            agree to be bound by these Terms. Please read them carefully before purchasing.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              1. General Use
            </h2>
            <p className="mb-3">
              By accessing or using our website, you confirm that you are at least 18 years of age
              (or have the consent of a parent/guardian), and that the information you provide is
              accurate and complete. We reserve the right to refuse service, cancel orders, or
              terminate accounts at our sole discretion for violation of these Terms or for any
              other reason we deem appropriate.
            </p>
            <p>
              You agree not to use the website for any unlawful purpose, to submit infringing
              content, or to attempt to disrupt or compromise the security of our systems.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              2. User Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>
                You must provide a valid delivery address. We are not responsible for non-delivery
                due to incorrect or incomplete address information.
              </li>
              <li>
                When uploading designs for custom prints, you warrant that you own or have the
                necessary rights to use the uploaded content (see Section 7 on Intellectual
                Property).
              </li>
              <li>
                You agree not to reproduce, duplicate, copy, sell, or exploit any portion of the
                website without our express written permission.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              3. Product &amp; Service Descriptions
            </h2>
            <p className="mb-3">
              All products sold on {SITE.name} are <strong>made-to-order</strong> using multi-colour
              FDM 3D printing technology. As a result:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Colour &amp; Finish Variation:</strong> actual colours and finishes may
                vary slightly from product images due to the nature of 3D printing, monitor
                calibration, and material batch variations. We strive for consistency but cannot
                guarantee pixel-perfect colour matches.
              </li>
              <li>
                <strong>Dimensional Tolerances:</strong> dimensions are approximate; minor
                variations of ±2–3 mm are inherent to the FDM printing process.
              </li>
              <li>
                <strong>Lead Times:</strong> made-to-order items typically require 2–4 additional
                business days to print and finish before dispatch. Please refer to our{' '}
                <a href="/shipping-policy" className="text-brand hover:underline">
                  Shipping Policy
                </a>{' '}
                for current estimates.
              </li>
              <li>
                We reserve the right to modify product specifications, discontinue items, or
                correct typographical errors in pricing at any time.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              4. Order Acceptance &amp; Cancellation
            </h2>
            <p className="mb-3">
              Your order constitutes an offer to purchase. We accept your offer when we send you
              an order confirmation. We reserve the right to refuse or cancel any order at our
              discretion (e.g., if a product is unavailable, if there is a pricing error, or if
              fraud is suspected). In such cases, you will receive a full refund.
            </p>
            <p className="mb-3">
              <strong>Customer-initiated cancellations:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Orders may be cancelled within <strong>2 hours</strong> of placing them, provided
                printing has not yet commenced. Contact us immediately via WhatsApp at{' '}
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  {SITE.phone}
                </a>
                .
              </li>
              <li>
                Once production has started, cancellations are not possible for made-to-order or
                custom-print items.
              </li>
              <li>
                For standard (non-custom) items, cancellations may be accepted up to 24 hours after
                order placement if the item has not yet been dispatched.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              5. Pricing &amp; Payment
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                All prices are listed in <strong>Indian Rupees (₹ / INR)</strong> and are
                inclusive of applicable taxes (GST) where shown.
              </li>
              <li>
                <strong>GST:</strong> our products attract the applicable GST rate as per Indian
                tax law. A GST-inclusive invoice is provided upon order confirmation.
              </li>
              <li>
                <strong>Prepaid payments</strong> are processed securely via{' '}
                <strong>Razorpay</strong> (credit/debit cards, UPI, net banking, wallets).
                {SITE.name} does not store your card details.
              </li>
              <li>
                <strong>Cash on Delivery (COD)</strong> is available for eligible orders. A
                nominal COD handling fee may apply and will be displayed at checkout.
              </li>
              <li>
                Prices are subject to change without notice; the price applicable to your order is
                the one shown at the time you placed it.
              </li>
              <li>
                Promotional discounts and coupon codes cannot be combined unless explicitly stated.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              6. Shipping &amp; Delivery
            </h2>
            <p>
              We ship pan-India. Delivery timelines, shipping charges, and related policies are
              detailed in our{' '}
              <a href="/shipping-policy" className="text-brand hover:underline">
                Shipping Policy
              </a>
              , which forms part of these Terms by reference. We are not liable for delays caused
              by courier partners, weather events, or circumstances beyond our control.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              7. Intellectual Property &amp; Custom Uploads
            </h2>
            <p className="mb-3">
              All content on <span className="text-brand">layerix.in</span> — including logos,
              product photos, designs, text, and software — is the property of {SITE.name} or its
              licensors and is protected under applicable Indian and international IP laws.
            </p>
            <p className="mb-3">
              When you upload a design file or submit text for a custom-print order:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You represent and warrant that you are the owner of the intellectual property in
                the uploaded content, or that you have obtained all necessary licences and
                permissions to use it for printing.
              </li>
              <li>
                You grant {SITE.name} a limited, non-exclusive licence to use the uploaded content
                solely for the purpose of fulfilling your order.
              </li>
              <li>
                We will not reproduce, sell, or use your uploaded designs for any purpose other
                than fulfilling your order.
              </li>
              <li>
                We reserve the right to refuse orders that contain content that is offensive,
                defamatory, illegal, or infringes third-party IP rights.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              8. Returns, Refunds &amp; Exchanges
            </h2>
            <p>
              Our return and refund policy is detailed in the{' '}
              <a href="/refund-and-returns-policy" className="text-brand hover:underline">
                Refund &amp; Returns Policy
              </a>
              , which forms part of these Terms. Made-to-order and personalised items are
              generally non-returnable except in cases of manufacturing defects or
              damage-in-transit.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              9. Limitation of Liability
            </h2>
            <p className="mb-3">
              To the maximum extent permitted by applicable Indian law, {SITE.name} and its
              directors, employees, and agents shall not be liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Any indirect, incidental, special, or consequential damages arising from your use of the website or our products.</li>
              <li>Loss of data, profits, or business opportunities.</li>
              <li>Delays or failures caused by events outside our reasonable control (force majeure).</li>
            </ul>
            <p className="mt-3">
              Our maximum aggregate liability for any claim arising out of or relating to these
              Terms or your use of the website shall not exceed the amount you paid for the
              specific order giving rise to the claim.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              10. Modifications to Terms
            </h2>
            <p>
              We reserve the right to update these Terms at any time. Changes take effect
              immediately upon posting to the website. The &quot;Last updated&quot; date at the
              top reflects the most recent revision. Continued use of the website after changes
              are posted constitutes your acceptance of the revised Terms.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              11. Governing Law &amp; Dispute Resolution
            </h2>
            <p className="mb-3">
              These Terms are governed by and construed in accordance with the laws of{' '}
              <strong>India</strong>. Any disputes arising out of or in connection with these
              Terms shall first be attempted to be resolved amicably through direct negotiation.
            </p>
            <p>
              If an amicable resolution is not reached within 30 days, both parties agree to
              submit to the exclusive jurisdiction of the courts located in{' '}
              <strong>Hyderabad, Telangana, India</strong>.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-surface rounded-card2 p-6 border border-gray-100">
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              Contact Us
            </h2>
            <p className="mb-4 text-sm">
              For any questions or concerns regarding these Terms, please contact us:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-medium text-ink">Business:</span>{' '}
                <span className="text-muted">{SITE.name}, {SITE.addressLines.join(', ')}</span>
              </li>
              <li>
                <span className="font-medium text-ink">Email:</span>{' '}
                <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
                  {SITE.email}
                </a>
              </li>
              <li>
                <span className="font-medium text-ink">Phone / WhatsApp:</span>{' '}
                <a href={SITE.phoneTel} className="text-brand hover:underline">
                  {SITE.phone}
                </a>
              </li>
              <li>
                <span className="font-medium text-ink">Support Hours:</span>{' '}
                <span className="text-muted">{SITE.supportHours}</span>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  )
}
