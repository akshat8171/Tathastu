'use client'

import { useState } from 'react'

interface ProductInfoProps {
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  description: string
  careGuide?: string
  shippingInfo?: string
}

export function ProductInfo({
  name,
  price,
  originalPrice,
  rating,
  reviewCount,
  description,
  careGuide,
  shippingInfo,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )

  function toggleSection(section: string) {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  function incrementQuantity() {
    setQuantity((prev) => prev + 1)
  }

  function decrementQuantity() {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal">
        {name}
      </h1>

      {/* Tax Info */}
      <p className="text-sm text-charcoal/60">* Inclusive of all taxes.</p>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(rating)
                  ? 'text-sage-green'
                  : i < rating
                  ? 'text-sage-green/50'
                  : 'text-charcoal/20'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-charcoal/70">({reviewCount})</span>
      </div>

      {/* Pricing */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-sans text-3xl font-bold text-charcoal">
          ₹ {price.toLocaleString()}
        </span>
        {originalPrice && (
          <>
            <span className="font-sans text-xl text-charcoal/50 line-through">
              ₹ {originalPrice.toLocaleString()}
            </span>
            {discountPercentage && (
              <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
                {discountPercentage}% off
              </span>
            )}
          </>
        )}
      </div>

      {/* Promotional Offers */}
      <div className="bg-sage-green/10 border border-sage-green/20 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-sage-green/20 pb-2">
          <span className="text-sm font-semibold">15% OFF on orders above ₹5999</span>
          <span className="text-xs border border-dashed border-charcoal px-2 py-1 rounded">
            NEWYEAR26
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-sage-green/20 pb-2">
          <span className="text-sm font-semibold">5% OFF on All Orders</span>
          <span className="text-xs border border-dashed border-charcoal px-2 py-1 rounded">
            RUSTIC5
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">10% OFF on orders above ₹2000</span>
          <span className="text-xs border border-dashed border-charcoal px-2 py-1 rounded">
            JOY10
          </span>
        </div>
      </div>

      {/* Sales Activity */}
      <div className="flex items-center gap-2 text-sm text-charcoal/70">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        <span>13 sold in last 8 hours</span>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label className="font-semibold text-charcoal">Quantity:</label>
        <div className="flex items-center border border-charcoal/20 rounded">
          <button
            onClick={decrementQuantity}
            className="px-4 py-2 hover:bg-cream transition-colors"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            readOnly
            className="w-16 text-center border-x border-charcoal/20 py-2"
          />
          <button
            onClick={incrementQuantity}
            className="px-4 py-2 hover:bg-cream transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 border-2 border-charcoal text-charcoal py-4 rounded-lg font-semibold hover:bg-charcoal hover:text-white transition-colors">
          ADD TO CART
        </button>
        <button className="flex-1 bg-sage-green hover:bg-sage-green/90 text-white py-4 rounded-lg font-semibold transition-colors">
          BUY IT NOW
        </button>
      </div>

      {/* Delivery Info */}
      <div className="space-y-3 border-t border-charcoal/20 pt-6">
        <div className="flex items-start gap-3 p-4 bg-cream/50 rounded-lg">
          <svg className="w-6 h-6 text-sage-green flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <div>
            <p className="font-semibold text-charcoal">Order in the next 5 hrs 26 mins</p>
            <p className="text-sm text-charcoal/70">to get it between Mon, 26th Jan and Thu, 29th Jan</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-cream/50 rounded-lg">
          <svg className="w-6 h-6 text-sage-green flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-charcoal">2 day delivery in Delhi NCR</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-cream/50 rounded-lg">
          <svg className="w-6 h-6 text-sage-green flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div>
            <p className="font-semibold text-charcoal">For Any Questions</p>
            <a href="https://wa.me/1234567890" className="text-sm text-sage-green underline">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-charcoal/20 pt-6">
        <p className="font-semibold text-charcoal mb-3">We Accept:</p>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-2xl font-bold text-blue-600">VISA</span>
          <span className="text-2xl font-bold text-red-600">Mastercard</span>
          <span className="text-sm font-semibold text-charcoal">Paytm</span>
          <span className="text-sm font-semibold text-charcoal">RuPay</span>
          <span className="text-sm font-semibold text-charcoal">UPI</span>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-2 border-t border-charcoal/20 pt-6">
        <button
          onClick={() => toggleSection('description')}
          className="w-full flex items-center justify-between p-4 bg-cream/50 rounded-lg hover:bg-cream transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-sage-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-charcoal">DESCRIPTION</span>
          </div>
          <svg
            className={`w-5 h-5 text-charcoal transition-transform ${
              expandedSections.has('description') ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.has('description') && (
          <div className="p-4 bg-cream/30 rounded-lg">
            <p className="text-charcoal/80 leading-relaxed">{description}</p>
          </div>
        )}

        {careGuide && (
          <>
            <button
              onClick={() => toggleSection('care')}
              className="w-full flex items-center justify-between p-4 bg-cream/50 rounded-lg hover:bg-cream transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-sage-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-semibold text-charcoal">CARE GUIDE</span>
              </div>
              <svg
                className={`w-5 h-5 text-charcoal transition-transform ${
                  expandedSections.has('care') ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.has('care') && (
              <div className="p-4 bg-cream/30 rounded-lg">
                <p className="text-charcoal/80 leading-relaxed">{careGuide}</p>
              </div>
            )}
          </>
        )}

        {shippingInfo && (
          <>
            <button
              onClick={() => toggleSection('shipping')}
              className="w-full flex items-center justify-between p-4 bg-cream/50 rounded-lg hover:bg-cream transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-sage-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-semibold text-charcoal">SHIPPING INFORMATION</span>
              </div>
              <svg
                className={`w-5 h-5 text-charcoal transition-transform ${
                  expandedSections.has('shipping') ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.has('shipping') && (
              <div className="p-4 bg-cream/30 rounded-lg">
                <p className="text-charcoal/80 leading-relaxed">{shippingInfo}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
