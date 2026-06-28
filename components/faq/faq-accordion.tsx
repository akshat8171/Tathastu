'use client'

import { useState, useCallback } from 'react'

export interface FaqItem {
  question: string
  answer: React.ReactNode
}

export interface FaqGroup {
  title: string
  items: FaqItem[]
}

interface FaqAccordionProps {
  groups: FaqGroup[]
}

function AccordionItem({
  item,
  id,
  isOpen,
  onToggle,
}: {
  item: FaqItem
  id: string
  isOpen: boolean
  onToggle: () => void
}) {
  const headingId = `faq-heading-${id}`
  const panelId = `faq-panel-${id}`

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <h3>
        <button
          id={headingId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 py-4 text-left font-display font-semibold text-ink text-base sm:text-lg hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded transition-colors duration-150"
        >
          <span>{item.question}</span>
          {/* Chevron icon rotates when open */}
          <span
            aria-hidden="true"
            className={`flex-shrink-0 w-5 h-5 text-brand transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </h3>

      {/* Panel — controlled visibility via aria-hidden so screen readers skip it when closed */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        hidden={!isOpen}
        className="pb-4 font-sans text-muted text-sm sm:text-base leading-relaxed"
      >
        {item.answer}
      </div>
    </div>
  )
}

export function FaqAccordion({ groups }: FaqAccordionProps) {
  // Track which item IDs are open; allow multiple to be open simultaneously
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const toggle = useCallback((id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return (
    <div className="space-y-10">
      {groups.map((group, gi) => (
        <section key={group.title} aria-label={group.title}>
          {/* Group heading */}
          <div className="mb-4 pb-2 border-b-2 border-brand/20">
            <h2 className="font-display font-bold text-ink text-lg sm:text-xl">
              {group.title}
            </h2>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-100">
            {group.items.map((item, ii) => {
              const id = `g${gi}-i${ii}`
              return (
                <AccordionItem
                  key={id}
                  item={item}
                  id={id}
                  isOpen={openIds.has(id)}
                  onToggle={() => toggle(id)}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
