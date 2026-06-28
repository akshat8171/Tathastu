'use client'

import { useState } from 'react'
import { Rating } from '@/components/ui/rating'
import { Price } from '@/components/ui/price'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import { ProductOptions, type ProductOption } from './product-options'
import { ProductCustomFields, type CustomTextConfig } from './product-custom-fields'
import { waLink } from '@/lib/site'
import { useWishlist } from '@/components/wishlist/wishlist-context'

// ── Default benefit bullets used when product.benefits is absent ──────────────
const DEFAULT_BENEFITS: string[] = [
  'Premium multi-colour 3D-printed design',
  'Made to order — every piece is fresh from the printer',
  'Crafted in India using PLA / PLA+ filament',
  'Lightweight and durable construction',
  'Unique statement piece for any space',
  'Backed by our easy support policy',
]

interface SpecsShape {
  material?: string
  dimensions?: string
  printTech?: string
  finish?: string
  weight?: string
  origin?: string
}

interface ProductInfoProps {
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  description: string
  careGuide?: string
  shippingInfo?: string
  productId: string
  image: string
  // Optional enriched fields (all guarded; products lacking them still render)
  options?: ProductOption[]
  colors?: string[]
  customText?: CustomTextConfig | null
  customizable?: boolean
  specs?: SpecsShape | null
  benefits?: string[]
  about?: string
  keyFeatures?: string[]
  perfectFor?: string[]
  whyBuy?: string
}

type Section = 'description' | 'care' | 'shipping' | 'specs' | 'about'

export function ProductInfo({
  name,
  price,
  originalPrice,
  rating,
  reviewCount,
  description,
  careGuide,
  shippingInfo,
  productId,
  image,
  options,
  colors,
  customText,
  customizable,
  specs,
  benefits,
  about,
  keyFeatures,
  perfectFor,
  whyBuy,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [openSection, setOpenSection] = useState<Section | null>('description')
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [customTextValue, setCustomTextValue] = useState('')
  const [showCustomError, setShowCustomError] = useState(false)

  const { isWishlisted, toggle, requiresAuth } = useWishlist()
  const wishlisted = isWishlisted(productId)

  // ── CTA state logic ─────────────────────────────────────────────────────────
  const hasOptions = options && options.length > 0
  const hasCustomText = !!customText
  const allOptionsSelected = !hasOptions || options!.every((o) => !!selections[o.name])
  const customTextFilled = !hasCustomText || customTextValue.trim().length > 0

  // CTA label derivation
  let ctaLabel = 'Add to cart'
  let ctaDisabled = false

  if (!allOptionsSelected && !hasCustomText) {
    ctaLabel = 'Select options'
    ctaDisabled = true
  } else if (!allOptionsSelected && hasCustomText) {
    ctaLabel = 'Select options'
    ctaDisabled = true
  } else if (allOptionsSelected && hasCustomText && !customTextFilled) {
    ctaLabel = customizable ? 'Customize now' : 'Complete required details'
    ctaDisabled = true
  } else if (customizable && allOptionsSelected && customTextFilled) {
    ctaLabel = 'Add to cart'
  }

  function handleAddAttempt() {
    if (hasCustomText && customTextValue.trim().length === 0) {
      setShowCustomError(true)
      return
    }
    setShowCustomError(false)
  }

  function toggleSection(s: Section) {
    setOpenSection((prev) => (prev === s ? null : s))
  }

  const discountPct =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null

  // Specs rows — only non-null values
  const specRows: { label: string; value: string }[] = specs
    ? [
        specs.material    ? { label: 'Material',        value: specs.material }    : null,
        specs.printTech   ? { label: 'Print Technology', value: specs.printTech }  : null,
        specs.finish      ? { label: 'Finish',           value: specs.finish }     : null,
        specs.dimensions  ? { label: 'Dimensions',       value: specs.dimensions } : null,
        specs.weight      ? { label: 'Weight',           value: specs.weight }     : null,
        specs.origin      ? { label: 'Origin',           value: specs.origin }     : null,
      ].filter(Boolean) as { label: string; value: string }[]
    : []

  const displayBenefits = benefits && benefits.length > 0 ? benefits : DEFAULT_BENEFITS

  // Build WA link with product context
  const waHref = waLink(`Hi, I have a question about "${name}" (tathastukeepsakes.in/products/${productId})`)

  return (
    <div className="flex flex-col gap-5">
      {/* ── Name ──────────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-ink leading-tight flex-1">
          {name}
        </h1>
        {/* Wishlist / Save button (P2) */}
        <button
          type="button"
          onClick={async () => {
            if (requiresAuth) {
              // redirect handled inside toggle
            }
            await toggle(productId)
          }}
          aria-label={wishlisted ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
          aria-pressed={wishlisted}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 hover:border-brand hover:text-brand transition-colors text-ink group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={wishlisted ? 'text-red-500' : 'text-gray-400 group-hover:text-brand'}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-xs font-sans font-medium">{wishlisted ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* ── Rating summary ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Rating value={rating} count={reviewCount} />
        <span className="text-xs text-muted font-sans">
          Loved by {reviewCount}+ customers
        </span>
      </div>

      {/* ── Price ─────────────────────────────────────────────────────────────── */}
      <div>
        <Price current={price} compareAt={originalPrice} showDiscount />
        <p className="text-xs text-muted font-sans mt-1">Inclusive of all taxes</p>
      </div>

      {/* ── Coupon ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 bg-brand/5 border border-brand/20 rounded-xl px-4 py-3">
        <svg
          className="w-5 h-5 text-brand flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <p className="text-sm font-sans text-ink">
          Use code{' '}
          <code className="font-display font-semibold text-brand bg-brand/10 px-1.5 py-0.5 rounded">
            FIRST20
          </code>{' '}
          for <strong>20% OFF</strong> your first order
        </p>
      </div>

      {/* ── Option selectors (P0) ─────────────────────────────────────────────── */}
      {hasOptions && (
        <ProductOptions
          options={options!}
          selections={selections}
          onChange={setSelections}
          colors={colors}
        />
      )}

      {/* ── Custom text input (P0) ────────────────────────────────────────────── */}
      {hasCustomText && customText && (
        <ProductCustomFields
          customText={customText}
          value={customTextValue}
          onChange={(v) => {
            setCustomTextValue(v)
            if (v.trim().length > 0) setShowCustomError(false)
          }}
          showError={showCustomError}
        />
      )}

      {/* ── Quantity + Add to cart ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Quantity stepper */}
        <div className="flex items-center gap-4">
          <span className="font-display font-semibold text-sm text-ink">Quantity</span>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-10 h-10 flex items-center justify-center text-ink hover:bg-surface transition-colors font-display font-semibold text-lg"
            >
              −
            </button>
            <span
              className="w-12 text-center font-display font-semibold text-sm text-ink"
              aria-live="polite"
              aria-label={`Quantity: ${quantity}`}
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-10 h-10 flex items-center justify-center text-ink hover:bg-surface transition-colors font-display font-semibold text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to cart — conditional CTA (P0) */}
        <div onClick={handleAddAttempt}>
          <AddToCartButton
            product={{
              id: productId,
              name,
              price,
              originalPrice: originalPrice ?? price,
              image,
            }}
            label={ctaLabel}
            disabled={ctaDisabled}
            customText={customTextValue || undefined}
            selectedOptions={Object.keys(selections).length > 0 ? selections : undefined}
            className="w-full !bg-brand hover:!bg-brand-600 !rounded-xl !py-3.5 !text-base font-display font-semibold disabled:!opacity-60 disabled:!cursor-not-allowed"
          />
        </div>

        {/* Under-CTA helper text (P1 trust copy) */}
        {ctaDisabled && (
          <p className="text-xs text-center text-muted font-sans">
            {!allOptionsSelected
              ? 'Please select all options above to continue.'
              : 'Please fill in the required personalisation field above.'}
          </p>
        )}
      </div>

      {/* ── 4-badge trust row (P1) ────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {[
          {
            icon: (
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
            label: 'Secure Checkout',
          },
          {
            icon: (
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            ),
            label: 'Pan-India Delivery',
          },
          {
            icon: (
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            ),
            label: 'Made to Order',
          },
          {
            icon: (
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            ),
            label: 'Multi-colour Print',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 bg-surface rounded-xl py-3 px-1 text-center"
          >
            {item.icon}
            <span className="text-[10px] leading-tight font-sans text-muted">{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── Dispatch + damage copy (P1) ───────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 text-xs text-muted font-sans border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Dispatched in 2–4 business days · tracked shipping pan-India
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Easy support on damaged or incorrect prints — we make it right
        </div>
      </div>

      {/* ── Short description ─────────────────────────────────────────────────── */}
      <p className="text-sm text-muted font-sans leading-relaxed border-t border-gray-100 pt-5">
        {description}
      </p>

      {/* ── Rich description (P1) — About / Key Features / Perfect For / Why Buy */}
      {(about || (keyFeatures && keyFeatures.length > 0) || (perfectFor && perfectFor.length > 0) || whyBuy) && (
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
          {about && about !== description && (
            <div>
              <h3 className="font-display font-semibold text-sm text-ink mb-1.5">About</h3>
              <p className="text-sm text-muted font-sans leading-relaxed">{about}</p>
            </div>
          )}
          {keyFeatures && keyFeatures.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-sm text-ink mb-1.5">Key Features</h3>
              <ul className="flex flex-col gap-1" role="list">
                {keyFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted font-sans">
                    <svg className="w-3.5 h-3.5 text-brand mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {perfectFor && perfectFor.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-sm text-ink mb-1.5">Perfect For</h3>
              <div className="flex flex-wrap gap-1.5">
                {perfectFor.map((p, i) => (
                  <span key={i} className="text-xs font-sans bg-brand/8 text-brand/90 px-2.5 py-1 rounded-pill border border-brand/20">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
          {whyBuy && (
            <div className="bg-surface rounded-xl p-4">
              <h3 className="font-display font-semibold text-sm text-ink mb-1.5">Why buy from Tathastu Keepsakes?</h3>
              <p className="text-sm text-muted font-sans leading-relaxed">{whyBuy}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Specs block (P1) ─────────────────────────────────────────────────── */}
      {specRows.length > 0 && (
        <AccordionItem
          title="Specifications"
          isOpen={openSection === 'specs'}
          onToggle={() => toggleSection('specs')}
          icon={
            <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        >
          <dl className="divide-y divide-gray-100">
            {specRows.map((row) => (
              <div key={row.label} className="flex items-start gap-4 py-2.5">
                <dt className="w-32 flex-shrink-0 text-xs font-display font-semibold text-ink">{row.label}</dt>
                <dd className="text-xs text-muted font-sans flex-1">{row.value}</dd>
              </div>
            ))}
          </dl>
        </AccordionItem>
      )}

      {/* ── Benefits block (P1) ──────────────────────────────────────────────── */}
      <AccordionItem
        title="Why you'll love this"
        isOpen={openSection === 'about'}
        onToggle={() => toggleSection('about')}
        icon={
          <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        }
      >
        <ul className="flex flex-col gap-2" role="list">
          {displayBenefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-muted font-sans">
              <svg className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {b}
            </li>
          ))}
        </ul>
      </AccordionItem>

      {/* ── Accordion sections ────────────────────────────────────────────────── */}
      <div className="divide-y divide-gray-100 border-t border-gray-100">
        {careGuide && (
          <AccordionItem
            title="Care Guide"
            isOpen={openSection === 'care'}
            onToggle={() => toggleSection('care')}
            icon={
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          >
            <p className="text-sm text-muted font-sans leading-relaxed">{careGuide}</p>
          </AccordionItem>
        )}
        {shippingInfo && (
          <AccordionItem
            title="Shipping Information"
            isOpen={openSection === 'shipping'}
            onToggle={() => toggleSection('shipping')}
            icon={
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          >
            <p className="text-sm text-muted font-sans leading-relaxed">{shippingInfo}</p>
          </AccordionItem>
        )}
      </div>

      {/* ── WhatsApp link (P2) ────────────────────────────────────────────────── */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm font-sans text-muted hover:text-brand transition-colors"
        aria-label={`Chat on WhatsApp about ${name}`}
      >
        <svg className="w-4 h-4 text-[#25D366] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        Have a question? <span className="text-brand font-medium">Chat on WhatsApp</span>
      </a>
    </div>
  )
}

// ── Accordion ─────────────────────────────────────────────────────────────────

interface AccordionItemProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  icon: React.ReactNode
  children: React.ReactNode
}

function AccordionItem({ title, isOpen, onToggle, icon, children }: AccordionItemProps) {
  return (
    <div className="border-t border-gray-100">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between py-4 text-left hover:text-brand transition-colors"
      >
        <span className="flex items-center gap-2 font-display font-semibold text-sm text-ink">
          {icon}
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4">
          {children}
        </div>
      )}
    </div>
  )
}
