'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Button, Spinner } from '@/components/ui'
import { SITE, waLink } from '@/lib/site'
import productsData from '@/lib/products.json'

// ── Types ─────────────────────────────────────────────────────────────────────

type QuoteType = 'keychain' | 'portrait' | 'custom_object' | 'custom'
type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

interface Product {
  id: string
  name: string
  images: string[]
  category: string
  price: number
  customizable?: boolean
  description: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PRINT_TYPES: { value: QuoteType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'keychain',
    label: 'Keychain / Keyring',
    description: 'Custom name, photo or shape keychain',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    value: 'portrait',
    label: 'Photo Portrait',
    description: 'Turn your photo into a 3D-printed portrait',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    value: 'custom_object',
    label: 'Custom Object / Décor',
    description: "STL file, sketch or concept — we'll print it",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    value: 'custom',
    label: 'Something Else',
    description: "Describe your idea — we'll figure it out",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Share your idea',
    body: 'Upload a file (STL, image, or sketch) or describe what you have in mind — colour, size, material.',
  },
  {
    step: '02',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    title: 'We quote & print',
    body: 'Our team sends you a quote within 24 hours. Once approved, we 3D print your design with precision.',
  },
  {
    step: '03',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Delivered to your door',
    body: 'Your custom print is carefully packaged and shipped across India with tracking.',
  },
]

const WHY_US = [
  { icon: '🎨', title: 'Multi-colour printing', body: '20+ filament colours in stock. Metallic and glow-in-dark available.' },
  { icon: '⚡', title: 'Fast turnaround', body: 'Most custom orders ready in 3–5 business days after design approval.' },
  { icon: '📦', title: 'Pan-India shipping', body: 'Tracked delivery to every pin-code across India.' },
  { icon: '💬', title: 'WhatsApp support', body: 'Chat directly with our team — questions answered within the hour.' },
  { icon: '🔬', title: 'Precision FDM printing', body: 'Multi-colour FDM with PLA/PLA+ for durability and vivid colour.' },
  { icon: '✅', title: 'No minimum order', body: 'One keychain or a hundred — we handle any quantity with the same care.' },
]

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'stl', 'obj', 'pdf']

// ── Utility ───────────────────────────────────────────────────────────────────

function getExt(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

function isImageFile(filename: string): boolean {
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(getExt(filename))
}

// ── Component ─────────────────────────────────────────────────────────────────

function CustomizePageInner() {
  const searchParams = useSearchParams()

  // Derive initial type from ?type= query param
  const initialType = (): QuoteType => {
    const raw = searchParams?.get('type') ?? ''
    if ((PRINT_TYPES.map(t => t.value) as string[]).includes(raw)) return raw as QuoteType
    return 'custom'
  }

  const [selectedType, setSelectedType] = useState<QuoteType>(initialType)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileObj, setFileObj] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Customizable products for the rail
  const customizableProducts: Product[] = (productsData as Product[]).filter(
    (p) => p.customizable
  )

  // Sync type selector when ?type= changes (e.g. browser back/forward)
  useEffect(() => {
    setSelectedType(initialType())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // ── File handling ──────────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    const errors: Record<string, string> = {}
    if (file.size > MAX_FILE_SIZE) {
      errors.file = 'File must be under 25 MB'
      setFieldErrors(prev => ({ ...prev, ...errors }))
      return
    }
    const ext = getExt(file.name)
    if (!ALLOWED_EXT.includes(ext)) {
      errors.file = 'Unsupported file type. Use JPG, PNG, STL, OBJ, or PDF.'
      setFieldErrors(prev => ({ ...prev, ...errors }))
      return
    }
    setFieldErrors(prev => { const next = { ...prev }; delete next.file; return next })
    setFileName(file.name)
    setFileObj(file)
    if (isImageFile(file.name)) {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()

  const clearFile = () => {
    setFileName(null)
    setFileObj(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Client-side validation ─────────────────────────────────────────────────

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) errors.name = 'Enter your full name'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email'
    if (phone.trim() && !/^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      errors.phone = 'Enter a valid Indian mobile number'
    }
    if (!description.trim() && !fileObj) errors.description = 'Describe your idea or upload a file'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitState('submitting')
    setErrorMessage(null)

    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('email', email.trim())
      fd.append('phone', phone.trim())
      fd.append('type', selectedType)
      fd.append('description', description.trim())
      if (fileObj) fd.append('file', fileObj)

      const res = await fetch('/api/custom-quote', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) {
        if (json.fields) setFieldErrors(json.fields)
        setErrorMessage(json.error ?? 'Something went wrong — please try again.')
        setSubmitState('error')
        return
      }

      setSubmitState('success')
    } catch {
      setErrorMessage('Network error — check your connection and try again.')
      setSubmitState('error')
    }
  }

  // ── Derived UI ────────────────────────────────────────────────────────────

  const selectedTypeLabel = PRINT_TYPES.find(t => t.value === selectedType)?.label ?? 'Custom Print'
  const isPhotoType = selectedType === 'portrait' || selectedType === 'keychain'

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans text-sm transition-colors'

  const errorInputClass = `${inputClass} border-red-400 focus:ring-red-400 focus:border-red-400`

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-violet/10 via-surface to-white py-20 px-4">
        <div className="container-page">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block bg-brand/10 text-brand text-xs font-display font-semibold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-6">
              Custom 3D Prints
            </span>
            <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
              Have an idea?{' '}
              <span className="text-brand">We&apos;ll print it.</span>
            </h1>
            <p className="font-sans text-muted text-lg sm:text-xl leading-relaxed mb-10">
              Custom text, your own design, any colour — 3D printed and shipped across India.
              From one-off gifts to bulk corporate orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Upload Your Design
              </Button>
              <Button
                variant="outline"
                href={waLink('Hi! I want a custom 3D print quote.')}
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quote-first transparency */}
      <section className="py-10 px-4 bg-brand text-white">
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-display font-semibold text-lg sm:text-xl mb-2">
              100% transparent quoting — no surprise charges
            </p>
            <p className="font-sans text-white/80 text-sm sm:text-base">
              We send you a detailed price breakdown within 24 hours. You only pay after you approve the quote.
              No payment collected upfront for custom orders.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-surface">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-3">How it works</h2>
            <p className="font-sans text-muted text-base max-w-lg mx-auto">
              Three simple steps from idea to doorstep.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-7 left-[calc(50%+3rem)] right-0 h-px bg-brand/20" />
                )}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-card text-brand mb-4">
                  {s.icon}
                </div>
                <div className="font-display font-extrabold text-brand/30 text-3xl mb-1">{s.step}</div>
                <h3 className="font-display font-semibold text-ink text-base mb-2">{s.title}</h3>
                <p className="font-sans text-muted text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why print with us */}
      <section className="py-16 px-4 bg-white">
        <div className="container-page">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl mb-3">Why print with us?</h2>
            <p className="font-sans text-muted text-sm max-w-md mx-auto">
              {SITE.name} is a dedicated multi-colour 3D print studio based in Agra — not a generic marketplace.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {WHY_US.map(item => (
              <div key={item.title} className="flex gap-4 p-5 rounded-2xl bg-surface">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-display font-semibold text-ink text-sm mb-1">{item.title}</p>
                  <p className="font-sans text-muted text-xs leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customizable products rail */}
      {customizableProducts.length > 0 && (
        <section className="py-16 px-4 bg-surface">
          <div className="container-page">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl mb-2">
                  Customizable products
                </h2>
                <p className="font-sans text-muted text-sm">
                  Start from an existing design — add your name, photo, or message.
                </p>
              </div>
              <Link href="/products" className="font-sans text-brand text-sm hover:underline flex-shrink-0 ml-4">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {customizableProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-card overflow-hidden group">
                  <div className="relative aspect-square overflow-hidden bg-surface">
                    {product.images?.[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-display font-semibold text-ink text-sm leading-snug mb-1 line-clamp-2">
                      {product.name}
                    </p>
                    <p className="font-sans text-brand text-sm font-semibold mb-3">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex-1 btn-outline text-xs py-1.5 text-center"
                      >
                        Customize now
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedType('keychain')
                          document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="flex-1 btn-primary text-xs py-1.5 text-center"
                        aria-label={`Upload design for ${product.name}`}
                      >
                        Upload design
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upload / contact section */}
      <section id="upload-section" className="py-20 px-4 bg-white">
        <div className="container-page max-w-2xl mx-auto">

          {submitState === 'success' ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 text-brand mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl mb-3">
                Request received!
              </h2>
              <p className="font-sans text-muted text-base mb-2 max-w-md mx-auto">
                Thank you! Our team will review your {selectedTypeLabel.toLowerCase()} request and
                send you a quote within 24 hours.
              </p>
              <p className="font-sans text-muted text-sm mb-8 max-w-md mx-auto">
                For faster replies, ping us on WhatsApp — we typically respond within the hour.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  href={waLink('Hi! I submitted a custom print request.')}
                  size="lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp
                </Button>
                <Button variant="outline" href="/products" size="lg">
                  Browse our catalogue
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-3">
                  Request a custom print
                </h2>
                <p className="font-sans text-muted text-base">
                  Tell us what you have in mind. We&apos;ll send a no-obligation quote within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" aria-label="Custom print quote request">

                {/* Error banner */}
                {submitState === 'error' && errorMessage && (
                  <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-sans">
                    {errorMessage}
                  </div>
                )}

                {/* P0: Type selector */}
                <fieldset>
                  <legend className="block font-sans text-xs font-medium text-ink mb-2">
                    What are we printing? <span className="text-sale">*</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    {PRINT_TYPES.map((pt) => (
                      <label
                        key={pt.value}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          selectedType === pt.value
                            ? 'border-brand bg-brand/5'
                            : 'border-gray-200 hover:border-brand/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={pt.value}
                          checked={selectedType === pt.value}
                          onChange={() => setSelectedType(pt.value)}
                          className="sr-only"
                        />
                        <span className={`mt-0.5 flex-shrink-0 ${selectedType === pt.value ? 'text-brand' : 'text-muted'}`}>
                          {pt.icon}
                        </span>
                        <div>
                          <p className="font-display font-semibold text-ink text-sm leading-snug">{pt.label}</p>
                          <p className="font-sans text-muted text-xs mt-0.5 leading-snug">{pt.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Photo guidance (for portrait / keychain) */}
                {isPhotoType && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-sans text-amber-800">
                    <p className="font-semibold mb-1">📸 Photo tips for best results</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Use a clear, well-lit photo with a plain background if possible</li>
                      <li>Front-facing or 3/4 angle portraits work best</li>
                      <li>Higher resolution = sharper final print</li>
                      <li>We&apos;ll let you know if the photo needs retouching before printing</li>
                    </ul>
                  </div>
                )}

                {/* File drop zone */}
                <div>
                  <label className="block font-sans text-xs font-medium text-ink mb-1.5">
                    Upload a file <span className="text-muted font-normal">(optional — describe in the box below if no file)</span>
                  </label>
                  {imagePreview ? (
                    /* Image preview */
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                      <div className="relative h-48 w-full bg-surface">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Upload preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-gray-100">
                        <span className="font-sans text-xs text-muted truncate max-w-[70%]">{fileName}</span>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="font-sans text-xs text-red-500 hover:underline flex-shrink-0"
                          aria-label="Remove uploaded file"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      aria-label="Click or drag a file to upload"
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
                      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors group ${
                        fieldErrors.file
                          ? 'border-red-400 bg-red-50'
                          : 'border-brand/30 hover:border-brand hover:bg-brand/5'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".stl,.obj,.png,.jpg,.jpeg,.webp,.gif,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        aria-hidden="true"
                      />
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10 text-brand mb-3 group-hover:bg-brand group-hover:text-white transition-colors duration-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      {fileName ? (
                        <>
                          <p className="font-display font-semibold text-ink text-sm mb-1">{fileName}</p>
                          <p className="font-sans text-muted text-xs">Click to change file</p>
                        </>
                      ) : (
                        <>
                          <p className="font-display font-semibold text-ink text-sm mb-1">
                            Drag &amp; drop your file here
                          </p>
                          <p className="font-sans text-muted text-xs">
                            STL, OBJ, PNG, JPG, PDF — max 25 MB — or click to browse
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  {fieldErrors.file && (
                    <p role="alert" className="mt-1.5 font-sans text-xs text-red-500">{fieldErrors.file}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block font-sans text-xs font-medium text-ink mb-1.5" htmlFor="cq-description">
                    Describe your idea{' '}
                    {!fileObj && <span className="text-sale">*</span>}
                    {fileObj && <span className="text-muted font-normal">(optional — add any extra details)</span>}
                  </label>
                  <textarea
                    id="cq-description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={
                      selectedType === 'keychain'
                        ? 'E.g. A keychain with "Arjun & Priya" in bold, heart shape, teal colour, 6×4 cm...'
                        : selectedType === 'portrait'
                        ? 'E.g. Portrait of my family — 4 people, coloured, roughly 20×15 cm, for a gift...'
                        : 'E.g. A custom nameplate in teal, 15×5 cm, with "Sharma House" in Poppins font...'
                    }
                    rows={4}
                    className={fieldErrors.description ? errorInputClass : inputClass}
                    aria-describedby={fieldErrors.description ? 'cq-desc-error' : undefined}
                  />
                  {fieldErrors.description && (
                    <p id="cq-desc-error" role="alert" className="mt-1.5 font-sans text-xs text-red-500">
                      {fieldErrors.description}
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block font-sans text-xs font-medium text-ink mb-1.5" htmlFor="cq-name">
                    Your name <span className="text-sale">*</span>
                  </label>
                  <input
                    id="cq-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    className={fieldErrors.name ? errorInputClass : inputClass}
                    aria-describedby={fieldErrors.name ? 'cq-name-error' : undefined}
                  />
                  {fieldErrors.name && (
                    <p id="cq-name-error" role="alert" className="mt-1.5 font-sans text-xs text-red-500">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block font-sans text-xs font-medium text-ink mb-1.5" htmlFor="cq-email">
                    Email address <span className="text-sale">*</span>
                  </label>
                  <input
                    id="cq-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={fieldErrors.email ? errorInputClass : inputClass}
                    aria-describedby={fieldErrors.email ? 'cq-email-error' : undefined}
                  />
                  {fieldErrors.email && (
                    <p id="cq-email-error" role="alert" className="mt-1.5 font-sans text-xs text-red-500">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-sans text-xs font-medium text-ink mb-1.5" htmlFor="cq-phone">
                    Phone <span className="text-muted font-normal">(optional — for WhatsApp updates)</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0 border-gray-200 bg-surface text-muted text-sm font-sans flex-shrink-0">
                      🇮🇳 +91
                    </span>
                    <input
                      id="cq-phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Mobile number"
                      autoComplete="tel"
                      className={`flex-1 px-4 py-3 rounded-r-xl bg-surface border text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans text-sm transition-colors ${
                        fieldErrors.phone ? 'border-red-400' : 'border-gray-200'
                      }`}
                      aria-describedby={fieldErrors.phone ? 'cq-phone-error' : undefined}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p id="cq-phone-error" role="alert" className="mt-1.5 font-sans text-xs text-red-500">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={submitState === 'submitting'}
                  aria-busy={submitState === 'submitting'}
                >
                  {submitState === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" label="Submitting…" />
                      Sending request…
                    </span>
                  ) : (
                    'Submit Design Request'
                  )}
                </Button>

                <p className="font-sans text-xs text-muted text-center leading-relaxed">
                  You only pay after you approve the quote. No charge on submission.
                </p>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="font-sans text-muted text-sm">or reach us directly</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Direct contact CTAs */}
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href={waLink('Hi! I want a custom 3D print quote.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-brand/30 hover:bg-brand/5 transition-colors group"
                  aria-label="Chat on WhatsApp"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink text-sm">Chat on WhatsApp</p>
                    <p className="font-sans text-muted text-xs">{SITE.phone}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-brand/30 hover:bg-brand/5 transition-colors group"
                  aria-label="Email Tathastu Keepsakes"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink text-sm">Email us</p>
                    <p className="font-sans text-muted text-xs">{SITE.email}</p>
                  </div>
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-surface">
        <div className="container-page max-w-3xl">
          <h2 className="font-display font-bold text-ink text-2xl text-center mb-10">
            Common questions
          </h2>
          <div className="space-y-5">
            {[
              {
                q: 'What file formats do you accept?',
                a: 'STL and OBJ files are ideal for 3D printing. We also accept PNG, JPG, PDF sketches, and plain text descriptions — our designers will work with you to prepare the file.',
              },
              {
                q: 'How long does it take?',
                a: "Most custom prints are ready within 3–5 business days after design approval. Complex or large pieces may take longer — we'll confirm the timeline in your quote.",
              },
              {
                q: 'What materials and colours are available?',
                a: 'We print in PLA and PLA+. We stock 20+ colours and can source custom shades on request. Metallic and glow-in-the-dark filaments are also available.',
              },
              {
                q: 'Do you do bulk / corporate orders?',
                a: 'Yes! We offer bulk pricing for 10+ pieces. Visit our Bulk Orders page or WhatsApp us directly for a tailored quote.',
              },
              {
                q: 'When do I pay?',
                a: 'You pay only after you approve the quote — never upfront. Once you confirm, we ask for a 50% advance and collect the balance on dispatch.',
              },
            ].map(item => (
              <div key={item.q} className="bg-white rounded-2xl p-5 shadow-card">
                <h3 className="font-display font-semibold text-ink text-sm mb-2">{item.q}</h3>
                <p className="font-sans text-muted text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="font-sans text-muted text-sm mb-4">Still have questions?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                href={waLink('Hi! I have a question about custom printing.')}
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp us
              </Button>
              <Button variant="outline" href="/bulk-order" size="md">
                Bulk order inquiry
              </Button>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}

// useSearchParams() must be read inside a Suspense boundary so the page can be
// statically prerendered (Next.js client-side bailout requirement).
export default function CustomizePage() {
  return (
    <Suspense fallback={<div className="container-page py-20" aria-busy="true" />}>
      <CustomizePageInner />
    </Suspense>
  )
}
