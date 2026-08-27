import 'server-only'

import { revalidatePath } from 'next/cache'
import productsJson from '@/lib/products.json'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { mergeCatalog, listCatalogForAdmin, type CatalogDbRow } from './merge'
import { mergeHomepageSettings } from './homepage'
import { DEFAULT_HOMEPAGE_SETTINGS } from './homepage-defaults'
import { normalizeCatalogPayload } from './validate'
import type { CatalogListItem, CatalogProduct, HomepageSettings } from './types'

const jsonCatalog = productsJson as CatalogProduct[]

export const CATALOG_IMAGES_BUCKET = 'catalog-images'

function isMissingRelation(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const message = (error.message || '').toLowerCase()
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  )
}

async function loadDbRows(): Promise<CatalogDbRow[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('catalog_products')
      .select('id, payload, published')

    if (error) {
      if (!isMissingRelation(error)) {
        console.error('[catalog] load catalog_products failed:', error.message)
      }
      return []
    }

    return (data ?? []).map((row) => ({
      id: String(row.id),
      payload: (row.payload ?? {}) as CatalogProduct,
      published: Boolean(row.published),
    }))
  } catch (err) {
    console.error('[catalog] unexpected load error:', err)
    return []
  }
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const rows = await loadDbRows()
  return mergeCatalog(jsonCatalog, rows)
}

export async function getCatalogProduct(id: string): Promise<CatalogProduct | null> {
  const products = await getCatalogProducts()
  return products.find((product) => product.id === id) ?? null
}

export async function listAdminCatalog(): Promise<CatalogListItem[]> {
  const rows = await loadDbRows()
  return listCatalogForAdmin(jsonCatalog, rows)
}

export async function getAdminCatalogProduct(id: string): Promise<CatalogListItem | null> {
  const items = await listAdminCatalog()
  return items.find((item) => item.id === id) ?? null
}

export async function upsertCatalogProduct(
  raw: unknown,
  published: boolean
): Promise<{ ok: true; product: CatalogProduct } | { ok: false; error: string }> {
  const payload = normalizeCatalogPayload(raw)
  if ('error' in payload) return { ok: false, error: payload.error }

  try {
    const { error } = await supabaseAdmin.from('catalog_products').upsert(
      {
        id: payload.id,
        payload,
        published,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

    if (error) {
      console.error('[catalog] upsert failed:', error.message)
      return {
        ok: false,
        error: isMissingRelation(error)
          ? 'Catalog tables are not set up yet. Run supabase/migration-012-catalog-cms.sql in the Supabase SQL editor.'
          : 'Could not save the SKU',
      }
    }

    revalidateCatalog(payload.id)
    return { ok: true, product: payload }
  } catch (err) {
    console.error('[catalog] unexpected upsert error:', err)
    return { ok: false, error: 'Could not save the SKU' }
  }
}

export async function deleteCatalogProduct(
  id: string
): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  const seedExists = jsonCatalog.some((product) => product.id === id)

  try {
    const { data, error } = await supabaseAdmin
      .from('catalog_products')
      .delete()
      .eq('id', id)
      .select('id')

    if (error) {
      console.error('[catalog] delete failed:', error.message)
      return { ok: false, error: 'Could not delete the SKU' }
    }

    if (!data?.length && seedExists) {
      return {
        ok: false,
        status: 400,
        error: 'This SKU ships with the website. Unpublish it instead of deleting.',
      }
    }

    if (!data?.length) {
      return { ok: false, status: 404, error: 'SKU not found' }
    }

    revalidateCatalog(id)
    return { ok: true }
  } catch (err) {
    console.error('[catalog] unexpected delete error:', err)
    return { ok: false, error: 'Could not delete the SKU' }
  }
}

export async function getHomepageSettings(): Promise<HomepageSettings> {
  try {
    const { data, error } = await supabaseAdmin
      .from('homepage_settings')
      .select('settings')
      .eq('id', 1)
      .maybeSingle()

    if (error) {
      if (!isMissingRelation(error)) {
        console.error('[catalog] load homepage_settings failed:', error.message)
      }
      return DEFAULT_HOMEPAGE_SETTINGS
    }

    return mergeHomepageSettings(data?.settings)
  } catch (err) {
    console.error('[catalog] unexpected homepage load error:', err)
    return DEFAULT_HOMEPAGE_SETTINGS
  }
}

export async function saveHomepageSettings(
  raw: unknown
): Promise<{ ok: true; settings: HomepageSettings } | { ok: false; error: string }> {
  const settings = mergeHomepageSettings(raw)

  try {
    const { error } = await supabaseAdmin.from('homepage_settings').upsert(
      {
        id: 1,
        settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

    if (error) {
      console.error('[catalog] save homepage failed:', error.message)
      return {
        ok: false,
        error: isMissingRelation(error)
          ? 'Catalog tables are not set up yet. Run supabase/migration-012-catalog-cms.sql in the Supabase SQL editor.'
          : 'Could not save homepage settings',
      }
    }

    revalidatePath('/')
    revalidatePath('/products')
    return { ok: true, settings }
  } catch (err) {
    console.error('[catalog] unexpected homepage save error:', err)
    return { ok: false, error: 'Could not save homepage settings' }
  }
}

export async function uploadCatalogImage(
  file: File,
  productId?: string
): Promise<{ ok: true; url: string; path: string } | { ok: false; error: string }> {
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  if (!allowed.has(file.type)) {
    return { ok: false, error: 'Photos must be JPEG, PNG, WebP, or GIF' }
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: 'Each photo must be under 8 MB' }
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const folder = productId && /^[a-z0-9-]{3,80}$/.test(productId) ? productId : 'pending'
  const path = `${folder}/${Date.now()}-${safeName}`

  try {
    const { data, error } = await supabaseAdmin.storage.from(CATALOG_IMAGES_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

    if (error || !data?.path) {
      console.error('[catalog] image upload failed:', error)
      return {
        ok: false,
        error:
          error?.message?.includes('Bucket not found') || error?.message?.includes('not found')
            ? 'Create the public catalog-images bucket (migration 012) in Supabase Storage.'
            : 'Could not upload the photo',
      }
    }

    const { data: publicData } = supabaseAdmin.storage.from(CATALOG_IMAGES_BUCKET).getPublicUrl(data.path)
    return { ok: true, url: publicData.publicUrl, path: data.path }
  } catch (err) {
    console.error('[catalog] unexpected image upload error:', err)
    return { ok: false, error: 'Could not upload the photo' }
  }
}

function revalidateCatalog(id: string) {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/shop', 'layout')
  revalidatePath(`/products/${id}`)
  revalidatePath('/rakhi')
  revalidatePath('/sitemap.xml')
}

export function getJsonCatalog(): CatalogProduct[] {
  return jsonCatalog
}
