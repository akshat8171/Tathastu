'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'

const steps = [
  {
    step: '01',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
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

type SubmitState = 'idle' | 'submitting' | 'success'

export default function CustomizePage() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setFileName(file.name)
      if (fileInputRef.current) {
        const dt = new DataTransfer()
        dt.items.add(file)
        fileInputRef.current.files = dt.files
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitState('submitting')
    // Simulate async "submission" — real backend not yet wired
    setTimeout(() => {
      setSubmitState('success')
    }, 800)
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans text-sm transition-colors'

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
                href="https://wa.me/919154892790"
                size="lg"
              >
                Chat on WhatsApp
              </Button>
            </div>
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
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
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

      {/* Upload / contact section */}
      <section id="upload-section" className="py-20 px-4 bg-white">
        <div className="container-page max-w-2xl mx-auto">

          {submitState === 'success' ? (
            /* Thank-you state */
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 text-brand mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl mb-3">
                Request received!
              </h2>
              <p className="font-sans text-muted text-base mb-8 max-w-md mx-auto">
                Thank you! Our team will review your design and get back to you within 24 hours with
                a quote. You can also reach us instantly on WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" href="https://wa.me/919154892790" size="lg">
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
                  Upload your design
                </h2>
                <p className="font-sans text-muted text-base">
                  Share a file or describe your idea. We accept STL, OBJ, images, or plain text descriptions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-brand/30 rounded-2xl p-10 text-center cursor-pointer hover:border-brand hover:bg-brand/5 transition-colors group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".stl,.obj,.png,.jpg,.jpeg,.webp,.pdf,.zip"
                    onChange={handleFileChange}
                    className="hidden"
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
                        STL, OBJ, PNG, JPG, PDF, ZIP — or click to browse
                      </p>
                    </>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block font-sans text-xs font-medium text-ink mb-1.5">
                    Describe your idea <span className="text-muted font-normal">(required if no file)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="E.g. A custom nameplate in teal, 15×5 cm, with the text 'Sharma House' in bold Poppins font..."
                    rows={4}
                    className={inputClass}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-sans text-xs font-medium text-ink mb-1.5">
                    Email address <span className="text-sale">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={inputClass}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={submitState === 'submitting'}
                >
                  {submitState === 'submitting' ? 'Sending...' : 'Submit Design Request'}
                </Button>
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
                  href="https://wa.me/919154892790"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-brand/30 hover:bg-brand/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink text-sm">Chat on WhatsApp</p>
                    <p className="font-sans text-muted text-xs">+91 91548 92790</p>
                  </div>
                </a>

                <a
                  href="mailto:layerix.in@gmail.com"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-brand/30 hover:bg-brand/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink text-sm">Email us</p>
                    <p className="font-sans text-muted text-xs">layerix.in@gmail.com</p>
                  </div>
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Trust / FAQ band */}
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
                a: 'Most custom prints are ready within 3–5 business days after design approval. Complex or large pieces may take longer — we\'ll confirm the timeline in your quote.',
              },
              {
                q: 'What materials and colours are available?',
                a: 'We print in PLA, PETG, and resin. We stock 20+ colours and can source custom shades on request. Metallic and glow-in-the-dark filaments are also available.',
              },
              {
                q: 'Do you do bulk / corporate orders?',
                a: 'Yes! We offer bulk pricing for 10+ pieces. Visit our Bulk Orders page or WhatsApp us directly for a tailored quote.',
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
              <Button variant="primary" href="https://wa.me/919154892790" size="md">
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
