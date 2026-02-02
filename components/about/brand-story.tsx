'use client'

import Image from 'next/image'
import Link from 'next/link'

export function BrandStory() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Critical inline CSS for brand-story logo - prevents layout shift */
        .image-content__image-container {
          position: relative !important;
          width: 100% !important;
          max-width: 400px !important;
          overflow: hidden !important;
        }
        .image-content__image-wrapper {
          position: relative !important;
          width: 100% !important;
          display: block !important;
          overflow: hidden !important;
        }
        .image-content__image-wrapper img,
        .image-content__image-wrapper span,
        .image-content__image-wrapper span img {
          max-width: 100% !important;
          max-height: 100% !important;
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
        }
        @media (max-width: 768px) {
          .image-content__image-container {
            max-width: 100% !important;
          }
        }
      `}} />
      <div className="about-brand-banner">
        <div className="container-fluid">
        <div className="section-block">
          <div className="row justify-content-center">
            <div className="col-lg-7 col-12 brand-story-content">
              <h3 className="section-title-1 text-center mb-3">About the Brand</h3>
              <div className="text-center">
                <div className="d-flex justify-content-center">
                  <div 
                    className="image-content__image-container overflow-hidden hero-img__wrap"
                    style={{ 
                      '--img-in-hero': '152px', 
                      paddingLeft: '7rem', 
                      paddingRight: '7rem',
                      position: 'relative',
                      width: '100%',
                      maxWidth: '400px',
                      overflow: 'hidden',
                    } as React.CSSProperties}
                  >
                    <a 
                      href="" 
                      className="image-content__image-wrapper" 
                      style={{ 
                        paddingTop: '35.94755661501788%',
                        position: 'relative',
                        width: '100%',
                        display: 'block',
                        overflow: 'hidden',
                      }}
                      onClick={(e) => e.preventDefault()}
                    >
                      <Image
                        src="/images/logo/layerix_text.svg"
                        alt="LayeriX Logo"
                        className="image-content__image scale-in"
                        priority
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        style={{
                          objectFit: 'contain',
                          width: '100%',
                          height: '100%',
                          maxWidth: '100%',
                          maxHeight: '100%',
                        }}
                      />
                    </a>
                  </div>
                </div>
                <div className="hero-image__space" style={{ '--hero-spacer': '10px' } as React.CSSProperties}></div>
                <div className="m-0 parallax-banner__sub rte mb-3 txt-body">
                  At Layerix, we believe that every miniature tells a story. We don&apos;t just create products; we craft art pieces that bring your tabletop worlds to life. Our journey began with a passion for combining cutting-edge 3D printing technology with traditional craftsmanship. Each piece undergoes meticulous design, precision printing, and careful hand-finishing to ensure the highest quality. We curate heirloom-quality essentials for collectors, painters, and gamers who appreciate the artistry behind every detail.
                </div>
                <div className="d-flex justify-content-center align-items-center">
                  <div className="mt-3 mb-1">
                    <Link href="/about" className="btn btn-slide-theme">
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .about-brand-banner {
          background: #99a58f;
          padding: 60px 0px;
          margin: 0;
          --g-font-color-subtop: #edeae5;
          --g-color-heading: #edeae5;
          --color-body-text: #edeae5;
          --color-body-text-rgb: 237, 234, 229;
        }

        @media (max-width: 750px) {
          .about-brand-banner {
            padding: 20px;
          }
        }

        .container-fluid {
          width: 100%;
          padding-right: 15px;
          padding-left: 15px;
          margin-right: auto;
          margin-left: auto;
          display: flex;
          justify-content: center;
        }

        .section-block {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
        }

        .brand-story-content {
          width: 100%;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -15px;
          margin-left: -15px;
        }

        .justify-content-center {
          justify-content: center;
        }

        .col-lg-7 {
          flex: 0 0 58.333333%;
          max-width: 58.333333%;
          padding-right: 15px;
          padding-left: 15px;
        }

        .col-12 {
          flex: 0 0 100%;
          max-width: 100%;
          padding-right: 15px;
          padding-left: 15px;
        }

        @media (max-width: 991px) {
          .col-lg-7 {
            flex: 0 0 100%;
            max-width: 100%;
          }
        }

        .section-title-1 {
          font-family: var(--g-font-1);
          font-size: var(--g-h3-font-size);
          font-weight: var(--g-h3-font-weight);
          letter-spacing: var(--g-h3-font-spacing);
          line-height: var(--g-h3-font-lineheight);
          text-transform: var(--g-h3-font-transform);
          color: var(--g-color-heading);
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .section-title-1 {
            font-size: var(--g-h3-font-size-mobile);
          }
        }

        .text-center {
          text-align: center;
        }

        .mb-3 {
          margin-bottom: 1rem;
        }

        .d-flex {
          display: flex;
        }

        .justify-content-center {
          justify-content: center;
        }

        .align-items-center {
          align-items: center;
        }

        .mt-3 {
          margin-top: 1rem;
        }

        .mb-1 {
          margin-bottom: 0.25rem;
        }

        .image-content__image-container {
          position: relative !important;
          width: 100% !important;
          max-width: 400px !important;
          overflow: hidden !important;
        }

        .hero-img__wrap {
          position: relative;
        }

        .image-content__image-wrapper {
          position: relative !important;
          width: 100% !important;
          display: block !important;
          overflow: hidden !important;
          text-decoration: none;
        }

        .image-content__image {
          transition: transform var(--duration-default) var(--anim-transition);
        }
        
        .image-content__image-wrapper img,
        .image-content__image-wrapper span,
        .image-content__image-wrapper span img {
          max-width: 100% !important;
          max-height: 100% !important;
          width: auto !important;
          height: auto !important;
        }

        .scale-in {
          animation: scaleIn 0.6s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .hero-image__space {
          height: var(--hero-spacer, 10px);
        }

        .parallax-banner__sub {
          font-family: var(--g-font-1);
          font-size: var(--g-p-font-size);
          font-weight: var(--g-p-font-weight);
          line-height: var(--g-p-font-lineheight);
          color: var(--color-body-text);
          text-align: center;
          max-width: 100%;
        }

        .rte {
          line-height: 1.7;
        }

        .txt-body {
          color: var(--color-body-text);
        }


        .overflow-hidden {
          overflow: hidden;
        }

        .m-0 {
          margin: 0;
        }
      `}</style>
      </div>
    </>
  )
}
