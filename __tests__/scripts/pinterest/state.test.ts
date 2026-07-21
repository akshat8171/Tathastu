/**
 * @jest-environment node
 *
 * Tests for state.ts — the append-only posted-log store that drives rotation.
 * Uses a real temp file per test (the module is filesystem-backed by design);
 * network is never touched.
 */

import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readLog, recordResult } from '@/scripts/pinterest/state'
import type { PostRecord } from '@/scripts/pinterest/types'

let tmpDir: string
let logPath: string
let counter = 0

beforeEach(async () => {
  // Unique dir per test — no Date.now()/random needed, a monotonic counter +
  // pid is enough and keeps tests deterministic.
  tmpDir = path.join(os.tmpdir(), `tk-pinterest-state-${process.pid}-${counter++}`)
  await fs.mkdir(tmpDir, { recursive: true })
  logPath = path.join(tmpDir, 'nested', 'posted-log.json')
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

function makeRecord(overrides: Partial<PostRecord> = {}): PostRecord {
  return {
    productId: 'p1',
    pinId: 'pin-1',
    boardId: 'b1',
    boardName: 'Board',
    title: 'A title',
    link: 'https://www.tathastukeepsakes.in/products/p1',
    postedAt: '2026-07-22T03:30:00.000Z',
    ...overrides,
  }
}

describe('readLog', () => {
  it('returns an empty log when the file is missing', async () => {
    const log = await readLog(logPath)
    expect(log).toEqual({ version: 1, posts: [] })
  })

  it('returns an empty log when the file is malformed JSON', async () => {
    await fs.mkdir(path.dirname(logPath), { recursive: true })
    await fs.writeFile(logPath, '{ not valid json', 'utf8')
    const log = await readLog(logPath)
    expect(log).toEqual({ version: 1, posts: [] })
  })

  it('returns an empty log when posts is not an array', async () => {
    await fs.mkdir(path.dirname(logPath), { recursive: true })
    await fs.writeFile(logPath, JSON.stringify({ version: 1, posts: 'nope' }), 'utf8')
    const log = await readLog(logPath)
    expect(log).toEqual({ version: 1, posts: [] })
  })

  it('reads back a well-formed log', async () => {
    await fs.mkdir(path.dirname(logPath), { recursive: true })
    const rec = makeRecord()
    await fs.writeFile(logPath, JSON.stringify({ version: 1, posts: [rec] }), 'utf8')
    const log = await readLog(logPath)
    expect(log.posts).toHaveLength(1)
    expect(log.posts[0]).toEqual(rec)
  })
})

describe('recordResult', () => {
  it('creates the file (and parent dirs) and appends the first record', async () => {
    const rec = makeRecord()
    const updated = await recordResult(rec, logPath)
    expect(updated.posts).toHaveLength(1)

    // Persisted to disk and re-readable.
    const reread = await readLog(logPath)
    expect(reread.posts[0]).toEqual(rec)
  })

  it('appends without dropping earlier records', async () => {
    await recordResult(makeRecord({ productId: 'p1', pinId: 'pin-1' }), logPath)
    await recordResult(makeRecord({ productId: 'p2', pinId: 'pin-2' }), logPath)
    const log = await readLog(logPath)
    expect(log.posts.map((p) => p.productId)).toEqual(['p1', 'p2'])
  })

  it('writes pretty-printed JSON with a trailing newline (clean git diffs)', async () => {
    await recordResult(makeRecord(), logPath)
    const text = await fs.readFile(logPath, 'utf8')
    expect(text.endsWith('\n')).toBe(true)
    expect(text).toContain('\n  "version": 1')
  })

  it('preserves version 1 in the written file', async () => {
    await recordResult(makeRecord(), logPath)
    const log = await readLog(logPath)
    expect(log.version).toBe(1)
  })

  it('leaves no lingering temp file (atomic write cleaned up via rename)', async () => {
    await recordResult(makeRecord(), logPath)
    const dir = path.dirname(logPath)
    const entries = await fs.readdir(dir)
    // Only the final log should remain — no "*.tmp" sibling from the atomic write.
    expect(entries).toEqual(['posted-log.json'])
    expect(entries.some((e) => e.includes('.tmp'))).toBe(false)
  })
})
