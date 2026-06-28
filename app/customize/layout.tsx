import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Custom 3D Printing Service India | Upload Design & Get Free Quote | ${SITE.name}`,
  description: 'Custom 3D printing service in India - upload your design or photo, get a free quote within 24 hours. Multi-colour FDM printing, PAN India delivery from Agra. No minimum order, personalized 3D printed gifts.',
  keywords: [
    'custom 3D printing India',
    '3D print my design',
    'upload design for 3D printing',
    'photo to 3D print',
    'custom 3D printed gifts',
    '3D printing service Agra',
    'personalized 3D prints India',
    'free 3D printing quote',
  ],
  openGraph: {
    title: `Custom 3D Printing Service India | Upload Your Design | ${SITE.name}`,
    description: 'Upload your design or photo and get a free 3D printing quote within 24 hours. Multi-colour printing with PAN India delivery.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What file formats do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'STL and OBJ files are ideal for 3D printing. We also accept PNG, JPG, PDF sketches, and plain text descriptions — our designers will work with you to prepare the file.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Most custom prints are ready within 3–5 business days after design approval. Complex or large pieces may take longer — we'll confirm the timeline in your quote.",
      },
    },
    {
      '@type': 'Question',
      name: 'What materials and colours are available?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We print in PLA and PLA+. We stock 20+ colours and can source custom shades on request. Metallic and glow-in-the-dark filaments are also available.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you do bulk / corporate orders?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! We offer bulk pricing for 10+ pieces. Visit our Bulk Orders page or WhatsApp us directly for a tailored quote.',
      },
    },
    {
      '@type': 'Question',
      name: 'When do I pay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You pay only after you approve the quote — never upfront. Once you confirm, we ask for a 50% advance and collect the balance on dispatch.',
      },
    },
  ],
}

export default function CustomizeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
