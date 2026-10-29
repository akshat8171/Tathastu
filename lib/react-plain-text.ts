import type { ReactElement, ReactNode } from 'react'

/**
 * Extract plain text from a React node tree (server-side / static elements).
 * Used for FAQPage JSON-LD where UI answers are rich JSX but schema needs text.
 */
export function extractPlainText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractPlainText).join('')
  if (typeof node === 'object' && node !== null && 'props' in node) {
    const el = node as ReactElement<{ children?: ReactNode }>
    return extractPlainText(el.props?.children)
  }
  return ''
}

/** Collapse whitespace for schema / meta fields. */
export function toSchemaText(node: ReactNode): string {
  return extractPlainText(node).replace(/\s+/g, ' ').trim()
}
