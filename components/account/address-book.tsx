'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Address } from '@/lib/supabase/account'
import { Spinner } from '@/components/ui/spinner'

// ── Shared input class (matches the checkout + profile forms) ─────────────────
const inputCls =
  'w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans'

// ── Form types + validation ───────────────────────────────────────────────────

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

// `'new'` = the add-address form; a string id = editing that address.
type EditTarget = string | 'new' | null

interface AddressBookProps {
  initial: Address[]
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * The account address book: lists all saved addresses and lets the user add,
 * edit, remove, and choose a default. Backed by /api/account/addresses.
 */
export function AddressBook({ initial }: AddressBookProps) {
  const router = useRouter()

  const [addresses, setAddresses] = useState<Address[]>(initial)
  const [editing, setEditing] = useState<EditTarget>(null)
  const [form, setForm] = useState<FormFields>(emptyForm())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [apiError, setApiError] = useState('')

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    setApiError('')
  }

  function startAdd() {
    setForm(emptyForm())
    setFieldErrors({})
    setApiError('')
    setEditing('new')
  }

  function startEdit(a: Address) {
    setForm(addressToForm(a))
    setFieldErrors({})
    setApiError('')
    setEditing(a.id)
  }

  function cancelEdit() {
    setEditing(null)
    setFieldErrors({})
    setApiError('')
  }

  async function refreshFromServer() {
    try {
      const res = await fetch('/api/account/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses((data.addresses ?? []) as Address[])
      }
    } catch {
      // Non-fatal: the router.refresh() below re-renders the server component.
    }
    router.refresh()
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
      const payload: Record<string, string> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address_line: form.address_line.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      }
      // Editing an existing address → include its id so the API updates in place.
      if (editing && editing !== 'new') payload.id = editing

      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 401) {
        window.location.href = '/login'
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setApiError((body as { error?: string }).error || 'Failed to save. Please try again.')
        return
      }

      setEditing(null)
      await refreshFromServer()
    } catch {
      setApiError('Network error. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id: string) {
    setBusyId(id)
    setApiError('')
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.status === 401) {
        window.location.href = '/login'
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setApiError((body as { error?: string }).error || 'Failed to remove. Please try again.')
        return
      }
      await refreshFromServer()
    } catch {
      setApiError('Network error. Please check your connection and try again.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleSetDefault(id: string) {
    setBusyId(id)
    setApiError('')
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.status === 401) {
        window.location.href = '/login'
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setApiError((body as { error?: string }).error || 'Failed to set default. Please try again.')
        return
      }
      await refreshFromServer()
    } catch {
      setApiError('Network error. Please check your connection and try again.')
    } finally {
      setBusyId(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Section heading */}
      <div className="bg-white rounded-card2 shadow-card p-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-ink text-xl">Addresses</h2>
          <p className="font-sans text-muted text-sm mt-1">
            Saved delivery addresses. Your default is pre-selected at checkout, and
            every new order&apos;s address is saved here automatically.
          </p>
        </div>
        {editing !== 'new' && (
          <button type="button" onClick={startAdd} className="btn-primary whitespace-nowrap">
            + Add address
          </button>
        )}
      </div>

      {apiError && (
        <p className="text-red-500 text-sm font-sans bg-red-50 rounded-lg px-4 py-3">{apiError}</p>
      )}

      {/* Add-new form */}
      {editing === 'new' && (
        <AddressForm
          heading="New address"
          form={form}
          fieldErrors={fieldErrors}
          saving={saving}
          onChange={handleChange}
          onSave={handleSave}
          onCancel={cancelEdit}
        />
      )}

      {/* Empty state */}
      {addresses.length === 0 && editing !== 'new' && (
        <div className="border-2 border-dashed border-gray-200 rounded-card2 p-8 text-center">
          <p className="font-sans text-sm text-muted mb-4">No saved addresses yet.</p>
          <button type="button" onClick={startAdd} className="btn-primary">
            + Add your first address
          </button>
        </div>
      )}

      {/* Address cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {addresses.map(addr =>
          editing === addr.id ? (
            <AddressForm
              key={addr.id}
              heading="Edit address"
              form={form}
              fieldErrors={fieldErrors}
              saving={saving}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={cancelEdit}
            />
          ) : (
            <div key={addr.id} className="bg-white rounded-card2 shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display font-semibold text-ink text-base">{addr.name}</h3>
                {addr.is_default && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                    Default
                  </span>
                )}
              </div>

              <div className="font-sans text-sm space-y-0.5 mb-5">
                <p className="text-muted">{addr.phone}</p>
                <p className="text-muted mt-1 leading-relaxed">
                  {addr.address_line}
                  <br />
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => startEdit(addr)} className="btn-primary">
                  Edit
                </button>
                {!addr.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={busyId === addr.id}
                    className="text-brand hover:text-brand/80 text-sm font-medium font-sans disabled:opacity-50"
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(addr.id)}
                  disabled={busyId === addr.id}
                  className="text-red-500 hover:text-red-600 text-sm font-medium font-sans disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {busyId === addr.id ? (
                    <>
                      <Spinner size="xs" />
                      <span>Working…</span>
                    </>
                  ) : (
                    'Remove'
                  )}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// ── Reusable address form card ────────────────────────────────────────────────

interface AddressFormProps {
  heading: string
  form: FormFields
  fieldErrors: Record<string, string>
  saving: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSave: (e: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

function AddressForm({
  heading,
  form,
  fieldErrors,
  saving,
  onChange,
  onSave,
  onCancel,
}: AddressFormProps) {
  return (
    <div className="bg-white rounded-card2 shadow-card p-6">
      <h3 className="font-display font-semibold text-ink text-base mb-5">{heading}</h3>
      <form onSubmit={onSave} noValidate className="space-y-4">
        <Field label="Full Name" name="name" value={form.name} error={fieldErrors.name} onChange={onChange} placeholder="Rahul Sharma" autoComplete="name" />
        <Field label="Phone" name="phone" value={form.phone} error={fieldErrors.phone} onChange={onChange} placeholder="9876543210" autoComplete="tel" inputMode="numeric" />

        <div>
          <label htmlFor="address_line" className="block text-sm font-medium text-ink mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address_line"
            name="address_line"
            value={form.address_line}
            onChange={onChange}
            placeholder="House/Flat no., Street, Colony"
            rows={3}
            autoComplete="street-address"
            className={`${inputCls} resize-none`}
          />
          {fieldErrors.address_line && (
            <p className="text-red-500 text-sm mt-1 font-sans">{fieldErrors.address_line}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="City" name="city" value={form.city} error={fieldErrors.city} onChange={onChange} placeholder="Mumbai" autoComplete="address-level2" />
          <Field label="State" name="state" value={form.state} error={fieldErrors.state} onChange={onChange} placeholder="Maharashtra" autoComplete="address-level1" />
        </div>

        <Field label="Pincode" name="pincode" value={form.pincode} error={fieldErrors.pincode} onChange={onChange} placeholder="400001" autoComplete="postal-code" inputMode="numeric" maxLength={6} />

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 inline-flex items-center gap-2">
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
            onClick={onCancel}
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

// ── Small labelled input ──────────────────────────────────────────────────────

interface FieldProps {
  label: string
  name: string
  value: string
  error?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  autoComplete?: string
  inputMode?: 'text' | 'numeric'
  maxLength?: number
}

function Field({ label, name, value, error, onChange, placeholder, autoComplete, inputMode, maxLength }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        className={inputCls}
      />
      {error && <p className="text-red-500 text-sm mt-1 font-sans">{error}</p>}
    </div>
  )
}
