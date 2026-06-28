'use client'

/**
 * ProductOptions — renders option selectors (e.g. Color, Finish, Size) from
 * the product.options array. Calls onChange with the current selections map
 * so the parent (ProductInfo) can gate Add-to-cart.
 */

export interface ProductOption {
  name: string
  values: string[]
  /** When true the user must pick before they can add to cart */
  required?: boolean
}

interface ProductOptionsProps {
  options: ProductOption[]
  selections: Record<string, string>
  onChange: (selections: Record<string, string>) => void
  /** Color array from product (shown as swatch circles in the Color option) */
  colors?: string[]
}

// Map well-known colour names to Tailwind-safe hex values for swatch rendering
const COLOR_HEX: Record<string, string> = {
  black:      '#1a1a1a',
  white:      '#f5f5f5',
  red:        '#dc2626',
  blue:       '#2563eb',
  green:      '#16a34a',
  yellow:     '#eab308',
  orange:     '#ea580c',
  purple:     '#9333ea',
  pink:       '#ec4899',
  grey:       '#6b7280',
  gray:       '#6b7280',
  brown:      '#92400e',
  terracotta: '#c2602d',
  sand:       '#d4a96a',
  natural:    '#d4b896',
  wood:       '#a1775a',
  silver:     '#c0c0c0',
  gold:       '#d4af37',
  ivory:      '#fffff0',
  cream:      '#fffdd0',
  teal:       '#0d9488',
  navy:       '#1e3a5f',
}

function swatchColor(name: string): string {
  return COLOR_HEX[name.toLowerCase()] ?? '#9ca3af'
}

export function ProductOptions({ options, selections, onChange, colors }: ProductOptionsProps) {
  if (!options || options.length === 0) return null

  function selectValue(optName: string, value: string) {
    onChange({ ...selections, [optName]: value })
  }

  return (
    <div className="flex flex-col gap-5">
      {options.map((opt) => {
        const isColorOption =
          opt.name.toLowerCase() === 'color' ||
          opt.name.toLowerCase() === 'colour'
        // Use colors[] from product if present, else fall back to option.values
        const displayValues = isColorOption && colors && colors.length > 0 ? colors : opt.values
        const selected = selections[opt.name]

        return (
          <div key={opt.name} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm text-ink">
                {opt.name}
              </span>
              {selected ? (
                <span className="text-xs text-muted font-sans">— {selected}</span>
              ) : (
                <span className="text-xs text-brand font-sans">Select one</span>
              )}
            </div>

            {isColorOption ? (
              /* Color swatches */
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Select ${opt.name}`}>
                {displayValues.map((val) => (
                  <button
                    key={val}
                    type="button"
                    role="radio"
                    aria-checked={selected === val}
                    aria-label={val}
                    title={val}
                    onClick={() => selectValue(opt.name, val)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                      selected === val
                        ? 'border-brand shadow-md scale-110'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: swatchColor(val) }}
                  />
                ))}
              </div>
            ) : (
              /* Text chips */
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Select ${opt.name}`}>
                {opt.values.map((val) => (
                  <button
                    key={val}
                    type="button"
                    role="radio"
                    aria-checked={selected === val}
                    onClick={() => selectValue(opt.name, val)}
                    className={`px-3 py-1.5 text-sm font-sans rounded-lg border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                      selected === val
                        ? 'bg-brand text-white border-brand font-medium'
                        : 'bg-white text-ink border-gray-200 hover:border-brand hover:text-brand'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
