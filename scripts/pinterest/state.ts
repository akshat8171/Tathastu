/**
 * state.ts — Read/append the committed posted-log.json de-dupe + rotation store.
 *
 * The log is the single source of truth for "what have we posted and when",
 * which drives selectProduct()'s rotation. CI commits it back after each run so
 * the next day sees updated history.
 *
 * Design choice: we only WRITE after a confirmed successful publish. A failed
 * run therefore leaves the log untouched and the next run retries cleanly — no
 * corruption, no phantom "posted" entries.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { PostedLog, PostRecord } from './types'

/** Absolute path to the state file, resolved from this module's location. */
export const LOG_PATH = path.join(__dirname, 'state', 'posted-log.json')

const EMPTY_LOG: PostedLog = { version: 1, posts: [] }

/**
 * Reads the posted log, tolerating a missing or malformed file (returns an empty
 * log so a first-ever run works without a pre-seeded file).
 */
export async function readLog(logPath: string = LOG_PATH): Promise<PostedLog> {
  let text: string
  try {
    text = await fs.readFile(logPath, 'utf8')
  } catch {
    return { ...EMPTY_LOG, posts: [] }
  }
  try {
    const parsed = JSON.parse(text) as Partial<PostedLog>
    if (!parsed || !Array.isArray(parsed.posts)) {
      return { ...EMPTY_LOG, posts: [] }
    }
    return { version: 1, posts: parsed.posts as PostRecord[] }
  } catch {
    // Malformed JSON — start clean rather than crash the whole run.
    return { ...EMPTY_LOG, posts: [] }
  }
}

/**
 * Appends a post record and writes the log back (pretty-printed for clean git
 * diffs). Returns the updated log.
 */
export async function recordResult(
  record: PostRecord,
  logPath: string = LOG_PATH,
): Promise<PostedLog> {
  const log = await readLog(logPath)
  log.posts.push(record)
  await fs.mkdir(path.dirname(logPath), { recursive: true })
  // Atomic write: serialize to a sibling temp file, then rename over the target.
  // rename(2) is atomic on POSIX, so a crash/kill mid-write can never leave a
  // truncated posted-log — which readLog would silently treat as empty and thus
  // restart the rotation (re-posting already-posted products). Temp lives in the
  // same directory so the rename stays on one filesystem.
  const tmpPath = `${logPath}.${process.pid}.tmp`
  await fs.writeFile(tmpPath, `${JSON.stringify(log, null, 2)}\n`, 'utf8')
  await fs.rename(tmpPath, logPath)
  return log
}
