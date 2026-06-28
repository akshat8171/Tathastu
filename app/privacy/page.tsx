import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE.name}`,
  description: `How ${SITE.name} collects, uses, and protects your personal information when you shop with us.`,
}

const LAST_UPDATED = 'June 2025'

export default function PrivacyPage() {
  return (
    <main className="bg-white py-16 px-4">
      <div className="container-page max-w-3xl">
        {/* Page header */}
        <div className="mb-10">
          <span className="inline-block bg-brand/10 text-brand text-xs font-display font-semibold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-4">
            Legal
          </span>
          <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl leading-tight mb-3">
            Privacy Policy
          </h1>
          <p className="font-sans text-muted text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose-content space-y-10 font-sans text-ink/80 leading-relaxed">

          {/* Intro */}
          <p className="text-lg">
            At <strong className="text-ink">{SITE.name}</strong> (&quot;we&quot;, &quot;us&quot;,
            or &quot;our&quot;), we are committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you visit{' '}
            <span className="text-brand font-medium">tathastukeepsakes.in</span> and place orders with us.
            Please read this policy carefully. If you disagree with its terms, please discontinue
            use of the site.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              We collect information you provide directly to us and information generated
              automatically when you use our service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account &amp; Identity:</strong> full name, mobile number (used for
                OTP-based login), and email address.
              </li>
              <li>
                <strong>Shipping Address:</strong> door/flat number, street, city, state, PIN code,
                and country — collected at checkout for order delivery.
              </li>
              <li>
                <strong>Order History:</strong> items ordered, quantities, prices, order status,
                and payment method (Prepaid via Razorpay or Cash on Delivery).
              </li>
              <li>
                <strong>Payment Information:</strong> we do <em>not</em> store your card details or
                banking credentials. Payments are processed securely through{' '}
                <strong>Razorpay</strong>; we only retain the Razorpay order ID and payment status.
              </li>
              <li>
                <strong>Custom-print uploads:</strong> images or text you submit when ordering a
                personalised product. These are used solely to fulfil your order.
              </li>
              <li>
                <strong>Device &amp; Log Data:</strong> IP address, browser type, pages visited,
                and referring URL — collected automatically via server logs and analytics for
                security and site improvement.
              </li>
              <li>
                <strong>Cookies:</strong> small text files stored in your browser (see Section 5
                below).
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and fulfil your orders, including dispatching to your address.</li>
              <li>Send order confirmations, shipping updates, and delivery notifications via SMS/WhatsApp.</li>
              <li>Authenticate your identity using OTP verification on login.</li>
              <li>Provide customer support and respond to your enquiries.</li>
              <li>Prevent fraudulent transactions and enhance account security.</li>
              <li>Improve our website, product catalogue, and service offerings.</li>
              <li>Send promotional communications (only with your explicit consent; you may opt out at any time).</li>
              <li>Comply with applicable Indian laws and regulations.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              3. Sharing of Your Information
            </h2>
            <p className="mb-3">
              We do not sell, trade, or rent your personal information to third parties. We share
              data only as necessary to run our business:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Payment Processor — Razorpay:</strong> your order amount and contact
                details are shared with Razorpay to process prepaid payments. Razorpay is PCI-DSS
                compliant and governs your payment data under{' '}
                <a
                  href="https://razorpay.com/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  Razorpay&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Courier / Logistics Partners:</strong> your name, delivery address, and
                phone number are shared with our courier partners (e.g., Shiprocket, Delhivery, or
                Bluedart) to facilitate delivery.
              </li>
              <li>
                <strong>Cloud Infrastructure:</strong> we use Supabase (database) and Vercel
                (hosting) for data storage and website delivery. Both providers maintain
                industry-standard security measures.
              </li>
              <li>
                <strong>Legal Obligations:</strong> we may disclose information where required by
                law, court order, or governmental authority in India.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              4. Data Security
            </h2>
            <p>
              We implement administrative, technical, and physical safeguards to protect your
              personal information from unauthorised access, use, or disclosure. Sensitive
              operations (order creation, payment updates) are performed server-side using
              encrypted connections (HTTPS/TLS). However, no method of transmission over the
              Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              5. Cookies
            </h2>
            <p className="mb-3">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain your shopping cart across sessions (stored in <code className="bg-gray-100 px-1 rounded text-sm">localStorage</code>).</li>
              <li>Keep you logged in securely after OTP verification.</li>
              <li>Analyse website traffic via privacy-respecting analytics.</li>
            </ul>
            <p className="mt-3">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is
              being sent. Note that some features of the site may not function properly without
              cookies.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              6. External Links
            </h2>
            <p>
              Our website may contain links to third-party sites (e.g., courier tracking pages,
              Razorpay payment gateway, Instagram). We are not responsible for the privacy
              practices of those sites and encourage you to review their respective privacy
              policies.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              7. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as your account is active or as
              needed to provide services, fulfil legal obligations, resolve disputes, and enforce
              our agreements. Order records are typically retained for 5 years in accordance with
              applicable Indian accounting and tax regulations. Custom-print files are deleted
              within 90 days of order fulfilment unless you request otherwise.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              8. Your Rights
            </h2>
            <p className="mb-3">
              Under applicable Indian data protection principles, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access:</strong> request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong>Correction:</strong> update inaccurate or incomplete information via your
                Account &gt; Profile page, or by contacting us.
              </li>
              <li>
                <strong>Deletion:</strong> request deletion of your account and associated personal
                data (subject to legal retention requirements).
              </li>
              <li>
                <strong>Opt-out:</strong> unsubscribe from marketing communications at any time by
                replying STOP to any SMS or contacting us directly.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at the details below. We will
              respond within 30 days.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              9. Modifications
            </h2>
            <p>
              We may update this Privacy Policy from time to time. The &quot;Last updated&quot;
              date at the top of this page indicates when the policy was last revised. Continued
              use of the website after any changes constitutes your acceptance of the updated
              policy. We recommend reviewing this page periodically.
            </p>
          </section>

          {/* Section 10 — Contact */}
          <section className="bg-surface rounded-card2 p-6 border border-gray-100">
            <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-3">
              10. Contact Us
            </h2>
            <p className="mb-4">
              For any privacy-related questions, requests, or concerns, please reach out to us:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-medium text-ink">Business:</span>{' '}
                <span className="text-muted">{SITE.name}</span>
              </li>
              <li>
                <span className="font-medium text-ink">Address:</span>{' '}
                <span className="text-muted">{SITE.addressLines.join(', ')}</span>
              </li>
              <li>
                <span className="font-medium text-ink">Email:</span>{' '}
                <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
                  {SITE.email}
                </a>
              </li>
              <li>
                <span className="font-medium text-ink">Phone:</span>{' '}
                <a href={SITE.phoneTel} className="text-brand hover:underline">
                  {SITE.phone}
                </a>
              </li>
              <li>
                <span className="font-medium text-ink">WhatsApp:</span>{' '}
                <a
                  href={SITE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  Chat with us
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
