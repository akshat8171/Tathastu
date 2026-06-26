'use client'

/**
 * ProductCustomFields — renders a required personalisation text input
 * when product.customText is present. Shows char counter + validation.
 */

export interface CustomTextConfig {
  label: string
  maxLength: number
  placeholder?: string
}

interface ProductCustomFieldsProps {
  customText: CustomTextConfig
  value: string
  onChange: (value: string) => void
  showError: boolean
}

export function ProductCustomFields({
  customText,
  value,
  onChange,
  showError,
}: ProductCustomFieldsProps) {
  const charCount = value.length
  const atLimit = charCount >= customText.maxLength
  const isEmpty = charCount === 0

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="product-custom-text"
          className="font-display font-semibold text-sm text-ink"
        >
          {customText.label}
          <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
        </label>
        <span
          className={`text-xs font-sans tabular-nums ${
            atLimit ? 'text-red-500 font-semibold' : 'text-muted'
          }`}
          aria-live="polite"
          aria-label={`${charCount} of ${customText.maxLength} characters used`}
        >
          {charCount}/{customText.maxLength}
        </span>
      </div>

      <input
        id="product-custom-text"
        type="text"
        value={value}
        maxLength={customText.maxLength}
        placeholder={customText.placeholder ?? `Enter ${customText.label.toLowerCase()}…`}
        onChange={(e) => onChange(e.target.value)}
        aria-required="true"
        aria-invalid={showError && isEmpty}
        aria-describedby={showError && isEmpty ? 'custom-text-error' : undefined}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm font-sans text-ink placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 transition-all ${
          showError && isEmpty
            ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
            : atLimit
            ? 'border-amber-400 focus:ring-amber-200'
            : 'border-gray-200 focus:ring-brand/30 focus:border-brand'
        }`}
      />

      {showError && isEmpty && (
        <p
          id="custom-text-error"
          className="text-xs text-red-500 font-sans"
          role="alert"
        >
          {customText.label} is required.
        </p>
      )}
    </div>
  )
}
