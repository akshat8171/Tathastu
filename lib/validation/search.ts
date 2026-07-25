/**
 * Sanitize a user-supplied search term before embedding it in a Supabase
 * PostgREST `.or(...)` / `.ilike(...)` filter string.
 *
 * WHY
 * ---
 * The admin list endpoints build filters like:
 *   .or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
 * In that grammar a COMMA starts a new OR condition and PARENS group them, so an
 * unsanitized value such as `x,id.gt.0` injects an attacker-controlled filter
 * condition (a PostgREST filter-injection). We strip the characters that carry
 * meaning in the filter grammar and the `ilike` wildcards we add ourselves
 * (`%`, `*`), plus the escape char, and cap length to bound the query.
 *
 * We deliberately KEEP `.`, spaces, `@`, `-`, `_`, `+` and unicode letters so
 * real names, emails and phone fragments still match — `.` is a literal in the
 * value position and is not a grammar separator there.
 *
 * Returns a safe string (possibly empty). Callers should treat an empty result
 * as "no search filter".
 */
export function sanitizeSearchTerm(raw: string | null | undefined, maxLength = 100): string {
  if (!raw) return ''
  return raw
    .replace(/[,()*%\\]/g, '') // strip PostgREST OR/group separators + ilike wildcards + escape
    .trim()
    .slice(0, maxLength)
}
