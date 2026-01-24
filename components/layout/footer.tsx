'use client'

import { useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'

export function Footer() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    about: false,
    collection: false,
    company: false,
    policy: false,
    needHelp: false,
    socialLinks: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <>
      <footer className="site-footer footer-sections--25165095698717__footer footer-acc-mobile">
        <div className="site-footer--head">
          <div className="container-fluid">
            <div className="row footer-sections-row">
              {/* About us */}
              <div className="col-lg-2 col-md-4 footer-section footer-section-about">
                <div className="site-footer__section text-lg-left">
                  <button
                    className="site-footer__section-title accordion-toggle"
                    onClick={() => toggleSection('about')}
                    aria-expanded={expandedSections.about}
                  >
                    <span>About us</span>
                    <span className="accordion-icon">
                      {expandedSections.about ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    className={`site-footer-block footer-left accordion-content ${
                      expandedSections.about ? 'expanded' : 'collapsed'
                    }`}
                  >
                    <div className="rte-setting">
                      A home should be a collection of stories and textures that stand the test of time. We curate pieces where raw, natural materials meet functional, modern design—from hand-thrown ceramics to reclaimed wood. We're here to help you find timeless objects that turn everyday rituals into lasting memories.
                    </div>
                  </div>
                </div>
              </div>

              {/* Collection */}
              <div className="col-lg-2 col-md-4 footer-section">
                <div className="site-footer__section text-lg-left">
                  <button
                    className="site-footer__section-title accordion-toggle"
                    onClick={() => toggleSection('collection')}
                    aria-expanded={expandedSections.collection}
                  >
                    <span>Collection</span>
                    <span className="accordion-icon">
                      {expandedSections.collection ? '−' : '+'}
                    </span>
                  </button>
                  <ul
                    className={`site-footer__list site-footer-block accordion-content ${
                      expandedSections.collection ? 'expanded' : 'collapsed'
                    }`}
                  >
                    <li className="site-footer__list-item">
                      <Link href="/collections/drinkware">Drinkware</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/collections/plates-platters">Plates & Platters</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/collections/bowls">Bowls</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/collections/table-essentials">Table Essentials</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/collections/urban-eden">Planters</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/collections/all-products">All Products</Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Company */}
              <div className="col-lg-2 col-md-4 footer-section">
                <div className="site-footer__section text-lg-left">
                  <button
                    className="site-footer__section-title accordion-toggle"
                    onClick={() => toggleSection('company')}
                    aria-expanded={expandedSections.company}
                  >
                    <span>Company</span>
                    <span className="accordion-icon">
                      {expandedSections.company ? '−' : '+'}
                    </span>
                  </button>
                  <ul
                    className={`site-footer__list site-footer-block accordion-content ${
                      expandedSections.company ? 'expanded' : 'collapsed'
                    }`}
                  >
                    <li className="site-footer__list-item">
                      <Link href="/pages/about-us">About Us</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/pages/visit-us">Visit Us</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/pages/faqs">FAQ&apos;s</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/pages/contact">Contact</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/pages/bulk-order">Bulk Order</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/blogs/news">Blog Posts</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/search">Search</Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Policy */}
              <div className="col-lg-2 col-md-4 footer-section">
                <div className="site-footer__section text-lg-left">
                  <button
                    className="site-footer__section-title accordion-toggle"
                    onClick={() => toggleSection('policy')}
                    aria-expanded={expandedSections.policy}
                  >
                    <span>Policy</span>
                    <span className="accordion-icon">
                      {expandedSections.policy ? '−' : '+'}
                    </span>
                  </button>
                  <ul
                    className={`site-footer__list site-footer-block accordion-content ${
                      expandedSections.policy ? 'expanded' : 'collapsed'
                    }`}
                  >
                    <li className="site-footer__list-item">
                      <Link href="/policies/privacy-policy">Privacy Policy</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/policies/shipping-policy">Shipping Policy</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/policies/refund-policy">Refund Policy</Link>
                    </li>
                    <li className="site-footer__list-item">
                      <Link href="/policies/terms-of-service">Terms of Service</Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Need help */}
              <div className="col-lg-2 col-md-4 footer-section">
                <div className="site-footer__section text-lg-left">
                  <button
                    className="site-footer__section-title accordion-toggle"
                    onClick={() => toggleSection('needHelp')}
                    aria-expanded={expandedSections.needHelp}
                  >
                    <span>Need help</span>
                    <span className="accordion-icon">
                      {expandedSections.needHelp ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    className={`site-footer-block footer-left accordion-content ${
                      expandedSections.needHelp ? 'expanded' : 'collapsed'
                    }`}
                  >
                    <div className="rte-setting">
                      <div>Chat on Whatsapp</div>
                      <br />
                      <a href="https://wa.me/+918882065253" target="_blank" rel="noopener noreferrer">
                        +91 8882065253
                      </a>
                      <br />
                      <br />
                      <div>For Bulk Orders & Enquiry:</div>
                      <br />
                      <a href="mailto:business@shoprusticstone.com" target="_blank" rel="noopener noreferrer">
                        business@shoprusticstone.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="col-lg-2 col-md-4">
                <div className="site-footer__section text-lg-left">
                  <button
                    className="site-footer__section-title accordion-toggle"
                    onClick={() => toggleSection('socialLinks')}
                    aria-expanded={expandedSections.socialLinks}
                  >
                    <span>Social Links</span>
                    <span className="accordion-icon">
                      {expandedSections.socialLinks ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    className={`site-footer-block footer-left accordion-content ${
                      expandedSections.socialLinks ? 'expanded' : 'collapsed'
                    }`}
                  >
                    <div className="rte-setting">
                      <div>Follow us on</div>
                      <div className="social-icons">
                        <a
                          href="https://www.facebook.com/profile.php?id=61565239826970"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-icon"
                        >
                          <i className="fa fa-facebook-f"></i>
                        </a>
                        <a
                          href="https://www.instagram.com/shop.rusticstone"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-icon"
                        >
                          <i className="fa fa-instagram"></i>
                        </a>
                        <a
                          href="https://in.pinterest.com/shoprusticstone/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-icon"
                        >
                          <i className="fa fa-pinterest-p"></i>
                        </a>
                        <a
                          href="https://www.linkedin.com/company/shoprusticstone/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-icon"
                        >
                          <i className="fa fa-linkedin"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="site-footer__copyright">
          <div className="container-fluid">
            <div className="d-flex flex-lg-row flex--sm-column flex-column-reverse">
              <div className="footer-copy-right">
                <ul
                  id="footer-payment-methods"
                  className="list-inline payment-icons text-center text-lg-right"
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}
                >
                  <li className="list-inline-item footer-payment-icon">
                    <img src="https://cdn.shopify.com/s/files/1/0893/1563/9581/files/upi.svg?v=1763794145" width="42px" height="auto" alt="UPI" />
                  </li>
                  <li className="list-inline-item footer-payment-icon">
                    <img src="https://cdn.shopify.com/s/files/1/0893/1563/9581/files/paytm.svg?v=1763794144" width="42px" height="auto" alt="Paytm" />
                  </li>
                  <li className="list-inline-item footer-payment-icon">
                    <img src="https://cdn.shopify.com/s/files/1/0893/1563/9581/files/google-pay.svg?v=1763794144" width="42px" height="auto" alt="Google Pay" />
                  </li>
                  <li className="list-inline-item footer-payment-icon">
                    <img src="https://cdn.shopify.com/s/files/1/0893/1563/9581/files/amazon-pay.svg?v=1763794144" width="64px" height="auto" alt="Amazon Pay" />
                  </li>
                </ul>
                <div className="pt-3">
                  <ul className="footer-bottom-link flex-wrap justify-content-center">
                    <li>
                      <Link href="/policies/privacy-policy">Privacy</Link>
                    </li>
                    <li>
                      <Link href="/policies/shipping-policy">Shipping</Link>
                    </li>
                    <li>
                      <Link href="/policies/refund-policy">Refund</Link>
                    </li>
                    <li>
                      <Link href="/policies/terms-of-service">Terms of Service</Link>
                    </li>
                  </ul>
                </div>
                <div className="flex-lg-grow-1">
                <div className="d-flex flex-column text-lg-left text-center pt-lg-0 pt-3">
                  <div className="d-flex flex-lg-row align-items-center justify-content-lg-start justify-content-center"></div>
                  <div className="pt-2">
                    <span className="pavan-theme">
                      Copyright © {new Date().getFullYear()} | Tathastu
                    </span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Font Awesome Script */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/js/all.min.js"
        strategy="lazyOnload"
      />

      <style jsx>{`
        .site-footer {
          --footer-bg: #3e5048;
          --footer-text: #ffffff;
          --footer-title: #ffffff;
          --footer-text-hover: #edeae5;
          --footer-font-size: 12px;
          --footer-font-weight: 500;
          --footer-font-space: 0.2em;
          --footer-font-type: uppercase;
          --footer-head-border: #e7e7e7;
          --color-footer-text-rgb: 255, 255, 255;
          --color-body-text: var(--footer-text);
          --footer-paddingtop: 64px;
          --footer-paddingbottom: 64px;
          --footer-paddingtop-m: 32px;
          --footer-paddingbottom-m: 0px;

          background-color: var(--footer-bg);
          color: var(--footer-text);
          border-top: 1px solid var(--footer-head-border);
        }

        .site-footer a {
          color: var(--footer-text);
        }

        .site-footer a:focus,
        .site-footer a:hover {
          color: var(--footer-text-hover);
        }

        .site-footer--head {
          padding-top: var(--footer-paddingtop);
          padding-bottom: var(--footer-paddingtop);
        }

        @media (max-width: 768px) {
          .site-footer--head {
            padding-top: var(--footer-paddingtop-m);
            padding-bottom: var(--footer-paddingtop-m);
          }
        }

        .container-fluid {
          width: 100%;
          padding-right: 15px;
          padding-left: 15px;
          margin-right: auto;
          margin-left: auto;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -15px;
          margin-left: -15px;
        }

        .footer-sections-row {
          display: flex;
          flex-wrap: wrap;
        }

        .footer-section {
          flex: 1 1 0;
          min-width: 0;
          padding-right: 15px;
          padding-left: 15px;
        }

        /* Desktop: Single line with About taking 2x space */
        @media (min-width: 992px) {
          .footer-sections-row {
            flex-wrap: nowrap;
          }
          
          .footer-section {
            flex: 1 1 0;
            max-width: 16.666667%;
            flex-basis: 16.666667%;
          }
          
          .footer-section-about {
            flex: 2 1 0;
            max-width: 33.333333%;
            flex-basis: 33.333333%;
          }
        }

        /* Tablet: 2 columns */
        @media (min-width: 768px) and (max-width: 991px) {
          .footer-section {
            flex: 0 0 50%;
            max-width: 50%;
            flex-basis: 50%;
          }
          
          .footer-section-about {
            flex: 0 0 50%;
            max-width: 50%;
            flex-basis: 50%;
          }
        }

        /* Mobile: Full width */
        @media (max-width: 767px) {
          .footer-section {
            flex: 0 0 100%;
            max-width: 100%;
            flex-basis: 100%;
          }
          
          .footer-section-about {
            flex: 0 0 100%;
            max-width: 100%;
            flex-basis: 100%;
          }
        }

        .col-lg-3 {
          flex: 0 0 25%;
          max-width: 25%;
          padding-right: 15px;
          padding-left: 15px;
        }

        .col-lg-2 {
          flex: 0 0 16.666667%;
          max-width: 16.666667%;
          padding-right: 15px;
          padding-left: 15px;
        }

        .col-md-6 {
          flex: 0 0 50%;
          max-width: 50%;
          padding-right: 15px;
          padding-left: 15px;
        }

        .col-md-4 {
          flex: 0 0 33.333333%;
          max-width: 33.333333%;
          padding-right: 15px;
          padding-left: 15px;
        }

        @media (max-width: 991px) {
          .col-lg-3,
          .col-lg-2 {
            flex: 0 0 50%;
            max-width: 50%;
          }
        }

        /* Override Bootstrap classes for footer sections to ensure proper width distribution */
        .footer-sections-row .footer-section.col-lg-2 {
          flex: 1 1 0;
          max-width: none;
        }

        /* Desktop: Single line layout */
        @media (min-width: 992px) {
          .footer-sections-row .footer-section.col-lg-2 {
            flex: 1 1 0;
            max-width: 16.666667%;
            flex-basis: 16.666667%;
          }
          
          .footer-sections-row .footer-section-about.col-lg-2 {
            flex: 2 1 0;
            max-width: 33.333333%;
            flex-basis: 33.333333%;
          }
        }

        /* Tablet: 2 columns */
        @media (min-width: 768px) and (max-width: 991px) {
          .footer-sections-row .footer-section.col-lg-2,
          .footer-sections-row .footer-section.col-md-4 {
            flex: 0 0 50%;
            max-width: 50%;
            flex-basis: 50%;
          }
          
          .footer-sections-row .footer-section-about.col-lg-2 {
            flex: 0 0 50%;
            max-width: 50%;
            flex-basis: 50%;
          }
        }

        /* Mobile: Full width */
        @media (max-width: 767px) {
          .footer-sections-row .footer-section.col-lg-2,
          .footer-sections-row .footer-section.col-md-4 {
            flex: 0 0 100%;
            max-width: 100%;
            flex-basis: 100%;
          }
          
          .footer-sections-row .footer-section-about.col-lg-2 {
            flex: 0 0 100%;
            max-width: 100%;
            flex-basis: 100%;
          }
        }

        @media (max-width: 767px) {
          .col-md-6,
          .col-md-4 {
            flex: 0 0 100%;
            max-width: 100%;
          }
        }

        .site-footer__section {
          margin-bottom: 2rem;
        }

        .site-footer__section-title {
          color: var(--footer-title);
          text-transform: var(--footer-font-type);
          font-weight: var(--footer-font-weight);
          font-size: var(--footer-font-size);
          letter-spacing: var(--footer-font-space);
          margin-bottom: 1rem;
        }

        .accordion-toggle {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          text-align: left;
          color: var(--footer-title);
          text-transform: var(--footer-font-type);
          font-weight: var(--footer-font-weight);
          font-size: var(--footer-font-size);
          letter-spacing: var(--footer-font-space);
          font-family: inherit;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        .accordion-toggle:focus {
          outline: none;
        }

        .accordion-icon {
          font-size: 18px;
          font-weight: 300;
          line-height: 1;
          color: var(--footer-text);
          transition: transform var(--duration-default) var(--anim-transition);
        }

        .accordion-content {
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      padding-top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      padding-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: max-height, opacity;
        }

        .accordion-content.collapsed {
          max-height: 0;
          opacity: 0;
          padding-top: 0;
          padding-bottom: 0;
          margin-top: 0;
          margin-bottom: 0;
        }

        .accordion-content.expanded {
          max-height: 2000px;
          opacity: 1;
          padding-top: 0;
          padding-bottom: 0;
        }

        /* On desktop, always show content and hide accordion icons */
        @media (min-width: 992px) {
          .accordion-icon {
            display: none;
          }

          .accordion-content {
            max-height: none !important;
            opacity: 1 !important;
            transition: none !important;
          }

          .accordion-content.collapsed,
          .accordion-content.expanded {
            max-height: none;
            opacity: 1;
            padding-top: 0;
            padding-bottom: 0;
            margin-top: 0;
          }
        }

        /* On mobile, show accordion functionality */
        @media (max-width: 991px) {
          .site-footer__section-title {
            margin-bottom: 0;
          }

          .accordion-content.collapsed {
            max-height: 0;
            opacity: 0;
            padding-top: 0;
            padding-bottom: 0;
            margin-top: 0;
          }

          .accordion-content.expanded {
            max-height: 2000px;
            opacity: 1;
            margin-top: 1rem;
            padding-top: 0;
            padding-bottom: 0;
          }
        }

        .h5 {
          font-size: var(--g-h5-font-size);
          font-weight: var(--g-h5-font-weight);
          line-height: var(--g-h5-font-lineheight);
        }

        .text-lg-left {
          text-align: left;
        }

        @media (max-width: 991px) {
          .text-lg-left {
            text-align: left;
          }
        }

        .site-footer-block {
          margin-bottom: 1rem;
        }

        .footer-left {
          text-align: left;
        }

        .rte-setting {
          font-size: var(--g-p-font-size);
          line-height: var(--g-p-font-lineheight);
          color: var(--footer-text);
        }

        .site-footer__list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .site-footer__list-item {
          margin-bottom: 0.5rem;
        }

        .site-footer__list-item a {
          position: relative;
          text-decoration: none;
          transition: color var(--duration-default) var(--anim-transition);
        }

        .site-footer__list-item a::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background-color: var(--footer-text-hover);
          transition: width var(--duration-default) var(--anim-transition);
        }

        .site-footer__list-item a:hover::before {
          width: 100%;
        }

        .social-icons {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 25px;
          margin-top: 20px;
        }

        .social-icon {
          color: var(--footer-text);
          font-size: 16px;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .social-icon:hover {
          color: #f0a500;
        }

        .site-footer__copyright {
          padding-top: 2rem;
          padding-bottom: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .d-flex {
          display: flex;
        }

        .flex-lg-row {
          flex-direction: row;
        }

        .flex--sm-column {
          flex-direction: column;
        }

        .flex-column-reverse {
          flex-direction: column-reverse;
        }

        @media (min-width: 992px) {
          .flex-lg-row {
            flex-direction: row;
          }
        }

        @media (max-width: 991px) {
          .flex--sm-column {
            flex-direction: column;
          }
        }

        .flex-lg-grow-1 {
          display: flex;
          flex-grow: 1;
        }

        @media (min-width: 992px) {
          .flex-lg-grow-1 {
            flex-grow: 1;
          }
        }

        .flex-column {
          flex-direction: column;
        }

        .text-center {
          text-align: center;
        }

        .text-lg-right {
          text-align: right;
        }

        @media (min-width: 992px) {
          .text-lg-right {
            text-align: right;
          }
        }

        .pt-lg-0 {
          padding-top: 0;
        }

        @media (min-width: 992px) {
          .pt-lg-0 {
            padding-top: 0;
          }
        }

        .pt-3 {
          padding-top: 1rem;
        }

        .pt-2 {
          padding-top: 0.5rem;
        }

        .pavan-theme {
          color: var(--footer-text);
          font-size: var(--g-p-font-size);
        }

        .footer-copy-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        @media (max-width: 991px) {
          .footer-copy-right {
            align-items: center;
          }
        }

        .list-inline {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .list-inline-item {
          display: inline-block;
        }

        .payment-icons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .payment-icon {
          width: 38px;
          height: 24px;
        }

        .footer-payment-icon {
          display: inline-flex;
          align-items: center;
        }

        .payment-icon-img {
          height: auto;
          width: auto;
        }

        .list-unstyled {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-bottom-link {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          align-items: center;
        }

        .footer-bottom-link li {
          margin: 0;
          display: flex;
          align-items: center;
        }

        .footer-bottom-link li:not(:last-child)::after {
          content: '|';
          margin: 0 1rem;
          color: var(--footer-text);
          opacity: 0.6;
        }

        .footer-bottom-link a {
          color: var(--footer-text);
          text-decoration: none;
          font-size: var(--g-p-font-size);
          transition: color var(--duration-default) var(--anim-transition);
        }

        .footer-bottom-link a:hover {
          color: var(--footer-text-hover);
        }

        .justify-content-center {
          justify-content: center;
        }

        .justify-content-lg-end {
          justify-content: flex-end;
        }

        @media (min-width: 992px) {
          .justify-content-lg-end {
            justify-content: flex-end;
          }
        }

        .align-items-center {
          align-items: center;
        }

        .justify-content-lg-start {
          justify-content: flex-start;
        }

        @media (min-width: 992px) {
          .justify-content-lg-start {
            justify-content: flex-start;
          }
        }
      `}</style>
    </>
  )
}
