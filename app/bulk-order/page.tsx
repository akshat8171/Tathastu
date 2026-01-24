'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BulkOrderPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
    alert('Thank you for your inquiry! We will contact you soon.')
  }

  return (
    <div className="bulk-order-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="separator">/</span>
            <span className="current">Bulk Order</span>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Bulk & Corporate Orders</h1>
          <p>You&apos;ve come to the right place.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="content-section">
        <div className="container">
          <div className="content-wrapper">
            <h2 className="section-title">Taking Bulk Orders</h2>
            <p className="description">
              Looking for high-quality homeware items in bulk? We&apos;ve got you covered! Whether you&apos;re a café, restaurant, 
              corporate event planner, or retailer, Rustic Stone offers bespoke bulk & corporate ordering solutions tailored 
              to your needs.
            </p>
            <p className="description">
              We are here to assist you through every step of the process and provide you with a solution that meets your 
              needs and exceeds your expectations.
            </p>
            <p className="contact-info">
              For any inquiries or to discuss your bulk / corporate order needs, please reach out to us at{' '}
              <a href="mailto:business@shoprusticstone.com">business@shoprusticstone.com</a> or call / whatsapp us at:{' '}
              <a href="tel:+918882065253">+91 88820 65253</a>.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="contact-methods">
            <div className="contact-card">
              <div className="contact-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h4>Call Us</h4>
              <a href="tel:+918882065253">+91-88820-65253</a>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h4>WhatsApp</h4>
              <a href="https://wa.me/918882065253" target="_blank" rel="noopener noreferrer">+91 88820 65253</a>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h4>Email</h4>
              <a href="mailto:business@shoprusticstone.com">business@shoprusticstone.com</a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="form-section">
            <h3 className="form-title">Got Any Questions?</h3>
            <p className="form-subtitle">Fill the form below, Our team will contact you soon!</p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row phone-row">
                <div className="country-code">
                  <span className="flag">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <textarea
                  name="message"
                  placeholder="Message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Submit</button>
              <p className="disclaimer">
                By signing up, you agree to receive marketing messages at the phone number or email provided. 
                Msg and data rates may apply. View our privacy policy and terms of service for more info.
              </p>
            </form>
          </div>
        </div>
      </section>

      <style jsx>{`
        .bulk-order-page {
          min-height: 100vh;
          background: #f5f5f5;
        }

        .breadcrumb-wrapper {
          background: #ffffff;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .container {
          width: 100%;
          max-width: 1200px;
          padding-right: 15px;
          padding-left: 15px;
          margin-right: auto;
          margin-left: auto;
        }

        .breadcrumb {
          font-family: var(--g-font-2);
          font-size: 13px;
          color: var(--color-body-text);
        }

        .breadcrumb a {
          color: var(--color-body-text);
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .breadcrumb .separator {
          margin: 0 8px;
          color: #999;
        }

        .breadcrumb .current {
          color: #666;
        }

        .hero-banner {
          position: relative;
          height: 350px;
          background-image: url('https://shoprusticstone.com/cdn/shop/files/stock-photo-table-decoration-with-tableware-and-flowers-on-the-wedding-table-1946714131.jpg?v=1751654163&width=2000');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: #ffffff;
        }

        .hero-content h1 {
          font-family: var(--g-font-1);
          font-size: 42px;
          font-weight: 400;
          margin-bottom: 10px;
          text-transform: capitalize;
        }

        .hero-content p {
          font-family: var(--g-font-2);
          font-size: 16px;
          font-weight: 300;
        }

        @media (max-width: 768px) {
          .hero-banner {
            height: 250px;
          }
          .hero-content h1 {
            font-size: 28px;
          }
        }

        .content-section {
          padding: 60px 0;
          background: #ffffff;
        }

        .content-wrapper {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          margin-bottom: 50px;
        }

        .section-title {
          font-family: var(--g-font-1);
          font-size: var(--g-h2-font-size);
          font-weight: var(--g-h2-font-weight);
          text-transform: var(--g-h2-font-transform);
          color: var(--g-color-heading);
          margin-bottom: 1.5rem;
        }

        .description {
          font-family: var(--g-font-2);
          font-size: 14px;
          line-height: 1.8;
          color: var(--color-body-text);
          margin-bottom: 1rem;
        }

        .contact-info {
          font-family: var(--g-font-2);
          font-size: 14px;
          line-height: 1.8;
          color: var(--color-body-text);
          margin-top: 1.5rem;
        }

        .contact-info a {
          color: var(--g-main-2);
          text-decoration: none;
        }

        .contact-info a:hover {
          text-decoration: underline;
        }

        .contact-methods {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 900px;
          margin: 0 auto 60px;
        }

        @media (max-width: 768px) {
          .contact-methods {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        .contact-card {
          text-align: center;
          padding: 20px;
        }

        .contact-icon {
          margin-bottom: 15px;
          color: var(--g-color-heading);
        }

        .contact-card h4 {
          font-family: var(--g-font-1);
          font-size: 14px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
          color: var(--g-color-heading);
        }

        .contact-card a {
          font-family: var(--g-font-2);
          font-size: 14px;
          color: var(--g-main-2);
          text-decoration: none;
        }

        .contact-card a:hover {
          text-decoration: underline;
        }

        .form-section {
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
        }

        .form-title {
          font-family: var(--g-font-1);
          font-size: 24px;
          font-weight: 400;
          color: var(--g-color-heading);
          margin-bottom: 8px;
        }

        .form-subtitle {
          font-family: var(--g-font-2);
          font-size: 14px;
          color: var(--color-body-text);
          margin-bottom: 30px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-row {
          width: 100%;
        }

        .form-row input,
        .form-row textarea {
          width: 100%;
          padding: 14px 16px;
          font-family: var(--g-font-2);
          font-size: 14px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: #f9f9f9;
          color: var(--color-body-text);
          transition: border-color 0.2s ease;
        }

        .form-row input:focus,
        .form-row textarea:focus {
          outline: none;
          border-color: var(--g-main-2);
        }

        .form-row input::placeholder,
        .form-row textarea::placeholder {
          color: #999;
        }

        .phone-row {
          display: flex;
          gap: 10px;
        }

        .country-code {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 16px;
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-family: var(--g-font-2);
          font-size: 14px;
          white-space: nowrap;
        }

        .flag {
          font-size: 18px;
        }

        .phone-row input {
          flex: 1;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          font-family: var(--g-font-family_btn);
          font-size: var(--g-font-size-btn);
          font-weight: var(--g-font-weight-btn);
          text-transform: var(--g-text-transform-btn);
          letter-spacing: var(--g-font-spacing-btn);
          background-color: var(--g-cta-button);
          color: var(--g-cta-text);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
        }

        .submit-btn:hover {
          background-color: var(--g-btn-hover-color);
          color: var(--g-cta-button);
          border: 1px solid var(--g-cta-button);
        }

        .disclaimer {
          font-family: var(--g-font-2);
          font-size: 11px;
          color: #999;
          line-height: 1.5;
          margin-top: 15px;
        }
      `}</style>
    </div>
  )
}
