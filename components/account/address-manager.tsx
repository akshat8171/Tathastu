'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Address, AddressType } from '@/lib/supabase/account'
import { Spinner } from '@/components/ui/spinner'

// ── Shared input class (matches existing forms) ───────────────────────────────
const inputCls =
  'w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans'

// ── Field-level validation helpers ───────────────────────────────────────────

function validateForm(f: FormFields): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!f.name.trim()) errors.name = 'Name is required.'
  if (!f.phone.trim()) {
    errors.phone = 'Phone is required.'
  } else if (!/^\d{10,}$/.test(f.phone.replace(/\s/g, ''))) {
    errors.phone = 'Enter a valid 10-digit phone number.'
  }
  if (!f.address_line.trim()) errors.address_line = 'Address is required.'
  if (!f.city.trim()) errors.city = 'City is required.'
  if (!f.state.trim()) errors.state = 'State is required.'
  if (!f.pincode.trim()) {
    errors.pincode = 'Pincode is required.'
  } else if (!/^\d{6}$/.test(f.pincode.trim())) {
    errors.pincode = 'Enter a valid 6-digit Indian pincode.'
  }
  return errors
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormFields {
  name: string
  phone: string
  address_line: string
  city: string
  state: string
  pincode: string
}

function emptyForm(): FormFields {
  return { name: '', phone: '', address_line: '', city: '', state: '', pincode: '' }
}

function addressToForm(a: Address): FormFields {
  return {
    name: a.name,
    phone: a.phone,
    address_line: a.address_line,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
  }
}

interface AddressManagerProps {
  type: AddressType
  label: string
  initial?: Address
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Renders one address slot (Billing or Shipping).
 *
 * States:
 *   - Filled + view mode   → shows address card with Edit + Remove buttons
 *   - Empty + view mode    → dashed card with "+ Add {label}" button
 *   - Edit mode            → inline form with Save + Cancel
 */
export function AddressManager({ type, label, initial }: AddressManagerProps) {
  const router = useRouter()

  const [address, setAddress] = useState<Address | undefined>(initial)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<FormFields>(
    initial ? addressToForm(initial) : emptyForm()
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [apiError, setApiError] = useState('')

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear per-field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    setApiError('')
  }

  function handleEdit() {
    setForm(address ? addressToForm(address) : emptyForm())
    setFieldErrors({})
    setApiError('')
    setEditing(true)
  }

  function handleCancel() {
    setEditing(false)
    setFieldErrors({})
    setApiError('')
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSaving(true)
    setApiError('')

    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_type: type,
          name: form.name.trim(),
          phone: form.phone.trim(),
          address_line: form.address_line.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        }),
      })

      if (res.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setApiError(
          (body as { error?: string }).error || 'Failed to save. Please try again.'
        )
        return
      }

      const data = await res.json()
      setAddress(data.address as Address)
      setEditing(false)
      router.refresh()
    } catch {
      setApiError('Network error. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    setApiError('')

    try {
      const res = await fetch('/api/account/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address_type: type }),
      })

      if (res.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setApiError(
          (body as { error?: string }).error || 'Failed to remove. Please try again.'
        )
        return
      }

      setAddress(undefined)
      setForm(emptyForm())
      router.refresh()
    } catch {
      setApiError('Network error. Please check your connection and try again.')
    } finally {
      setRemoving(false)
    }
  }

  // ── Edit form ────────────────────────────────────────────────────────────────

  if (editing) {
    return (
      <div className="bg-white rounded-card2 shadow-card p-6">
        {/* Card heading */}
        <h3 className="font-display font-semibold text-ink text-base mb-5">{label}</h3>

        <form onSubmit={handleSave} noValidate className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor={`${type}-name`} className="block text-sm font-medium text-ink mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id={`${type}-name`}
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              autoComplete="name"
              className={inputCls}
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-sm mt-1 font-sans">{fieldErrors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor={`${type}-phone`} className="block text-sm font-medium text-ink mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              id={`${type}-phone`}
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              autoComplete="tel"
              inputMode="numeric"
              className={inputCls}
            />
            {fieldErrors.phone && (
              <p className="text-red-500 text-sm mt-1 font-sans">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Address line */}
          <div>
            <label htmlFor={`${type}-address_line`} className="block text-sm font-medium text-ink mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id={`${type}-address_line`}
              name="address_line"
              value={form.address_line}
              onChange={handleChange}
              placeholder="House/Flat no., Street, Colony"
              rows={3}
              autoComplete="street-address"
              className={`${inputCls} resize-none`}
            />
            {fieldErrors.address_line && (
              <p className="text-red-500 text-sm mt-1 font-sans">{fieldErrors.address_line}</p>
            )}
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${type}-city`} className="block text-sm font-medium text-ink mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id={`${type}-city`}
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Mumbai"
                autoComplete="address-level2"
                className={inputCls}
              />
              {fieldErrors.city && (
                <p className="text-red-500 text-sm mt-1 font-sans">{fieldErrors.city}</p>
              )}
            </div>
            <div>
              <label htmlFor={`${type}-state`} className="block text-sm font-medium text-ink mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                id={`${type}-state`}
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                placeholder="Maharashtra"
                autoComplete="address-level1"
                className={inputCls}
              />
              {fieldErrors.state && (
                <p className="text-red-500 text-sm mt-1 font-sans">{fieldErrors.state}</p>
              )}
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label htmlFor={`${type}-pincode`} className="block text-sm font-medium text-ink mb-2">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              id={`${type}-pincode`}
              name="pincode"
              type="text"
              value={form.pincode}
              onChange={handleChange}
              placeholder="400001"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={6}
              className={inputCls}
            />
            {fieldErrors.pincode && (
              <p className="text-red-500 text-sm mt-1 font-sans">{fieldErrors.pincode}</p>
            )}
          </div>

          {/* API-level error */}
          {apiError && (
            <p className="text-red-500 text-sm font-sans">{apiError}</p>
          )}

          {/* Action row */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Spinner size="sm" />
                  <span>Saving…</span>
                </>
              ) : (
                'Save'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-ink hover:bg-surface font-sans text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ── Filled view ───────────────────────────────────────────────────────────────

  if (address) {
    return (
      <div className="bg-white rounded-card2 shadow-card p-6">
        {/* Heading + badge row */}
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-display font-semibold text-ink text-base">{label}</h3>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand">
            {type === 'billing' ? 'Billing' : 'Shipping'}
          </span>
        </div>

        {/* Address details */}
        <div className="font-sans text-sm space-y-0.5 mb-5">
          <p className="font-semibold text-ink">{address.name}</p>
          <p className="text-muted">{address.phone}</p>
          <p className="text-muted mt-1 leading-relaxed">
            {address.address_line}
            <br />
            {address.city}, {address.state} — {address.pincode}
          </p>
        </div>

        {/* API-level error (e.g. after a failed remove) */}
        {apiError && (
          <p className="text-red-500 text-sm font-sans mb-3">{apiError}</p>
        )}

        {/* Action row */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleEdit}
            className="btn-primary"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="text-red-500 hover:text-red-600 text-sm font-medium font-sans disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {removing ? (
              <>
                <Spinner size="xs" />
                <span>Removing…</span>
              </>
            ) : (
              'Remove'
            )}
          </button>
        </div>
      </div>
    )
  }

  // ── Empty view ────────────────────────────────────────────────────────────────

  return (
    <div className="border-2 border-dashed border-gray-200 rounded-card2 p-6 flex flex-col items-start gap-4">
      <h3 className="font-display font-semibold text-ink text-base">{label}</h3>
      <p className="font-sans text-sm text-muted">No address added yet.</p>

      {apiError && (
        <p className="text-red-500 text-sm font-sans">{apiError}</p>
      )}

      <button
        type="button"
        onClick={handleEdit}
        className="btn-primary"
      >
        + Add {label}
      </button>
    </div>
  )
}
