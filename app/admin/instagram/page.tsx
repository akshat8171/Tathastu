'use client'

import { useCallback, useEffect, useState } from 'react'
import { Camera, Link2, MessageCircle, RefreshCw, Unplug } from 'lucide-react'

interface StatusPayload {
  configured: boolean
  connected: boolean
  username: string | null
  redirectUri: string
  error?: string
}

interface InsightRow {
  name: string
  period: string
  value: number
}

interface CommentRow {
  id: string
  text: string
  username: string
  timestamp: string
}

interface MediaRow {
  id: string
  caption: string
  mediaType: string
  permalink: string
  thumbnailUrl: string | null
  timestamp: string
  likeCount: number | null
  commentsCount: number | null
  comments: CommentRow[]
}

interface DashboardPayload {
  profile: {
    username: string
    name: string | null
    followersCount: number | null
    followsCount: number | null
    mediaCount: number | null
    profilePictureUrl: string | null
  }
  insights: InsightRow[]
  media: MediaRow[]
}

function formatInsightName(name: string): string {
  return name.replace(/_/g, ' ')
}

export default function AdminInstagramPage() {
  const [status, setStatus] = useState<StatusPayload | null>(null)
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})

  const loadStatus = useCallback(async () => {
    const response = await fetch('/api/admin/instagram/status')
    if (response.status === 401) {
      window.location.href = '/login?next=/admin/instagram'
      return null
    }
    if (!response.ok) throw new Error('Could not load Instagram status')
    return (await response.json()) as StatusPayload
  }, [])

  const loadDashboard = useCallback(async () => {
    const response = await fetch('/api/admin/instagram/dashboard')
    if (response.status === 409) {
      setDashboard(null)
      const body = await response.json().catch(() => ({}))
      setError(typeof body.error === 'string' ? body.error : 'Connect Instagram first')
      return
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(typeof body.error === 'string' ? body.error : 'Could not load Insights')
    }
    setDashboard((await response.json()) as DashboardPayload)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('connected') === '1') setNotice('Instagram connected.')
    if (params.get('error')) setError(params.get('error'))
    async function boot() {
      try {
        setLoading(true)
        const nextStatus = await loadStatus()
        if (!nextStatus) return
        setStatus(nextStatus)
        if (nextStatus.error) setError(nextStatus.error)
        if (nextStatus.connected) await loadDashboard()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load Instagram')
      } finally {
        setLoading(false)
      }
    }
    void boot()
  }, [loadDashboard, loadStatus])

  async function handleDisconnect() {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/instagram/disconnect', { method: 'POST' })
      if (!response.ok) throw new Error('Could not disconnect')
      setDashboard(null)
      setStatus((prev) => (prev ? { ...prev, connected: false, username: null } : prev))
      setNotice('Disconnected. Tokens were deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not disconnect')
    } finally {
      setBusy(false)
    }
  }

  async function handleReply(commentId: string) {
    const message = replyDrafts[commentId] || ''
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/instagram/comments/${encodeURIComponent(commentId)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : 'Reply failed')
      }
      setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }))
      setNotice('Reply posted on Instagram.')
      await loadDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reply failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading Instagram…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <Camera className="w-7 h-7" aria-hidden />
            Instagram
          </h1>
          <p className="text-muted mt-1">
            Official Meta API — Insights and comment replies for @tathastukeepsakes. Publishing is not enabled yet.
          </p>
        </div>
        {status?.connected && (
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-white"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>

      {notice && (
        <p className="rounded-lg bg-green-50 text-green-800 px-4 py-3 text-sm" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm" role="alert">
          {error}
        </p>
      )}

      {!status?.configured && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-display font-semibold text-lg">1. Create the Meta app (once)</h2>
          <ol className="list-decimal list-inside text-sm text-ink-soft space-y-2">
            <li>In Instagram, switch the account to Professional if it is still personal.</li>
            <li>
              Open{' '}
              <a
                className="text-brand underline"
                href="https://developers.facebook.com/apps/"
                target="_blank"
                rel="noreferrer"
              >
                developers.facebook.com/apps
              </a>{' '}
              → Create app → Business.
            </li>
            <li>Add the product “Instagram” → Instagram API with Instagram Login.</li>
            <li>
              Valid OAuth redirect URI:{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{status?.redirectUri}</code>
            </li>
            <li>Roles → Instagram Testers: add @tathastukeepsakes and accept in the Instagram app.</li>
            <li>
              Put <code className="text-xs bg-gray-100 px-1">INSTAGRAM_APP_ID</code> and{' '}
              <code className="text-xs bg-gray-100 px-1">INSTAGRAM_APP_SECRET</code> in Vercel /{' '}
              <code className="text-xs bg-gray-100 px-1">.env.local</code>, then redeploy.
            </li>
            <li>
              Run <code className="text-xs bg-gray-100 px-1">supabase/migration-014-instagram-connection.sql</code> in
              the Supabase SQL editor.
            </li>
          </ol>
        </section>
      )}

      {status?.configured && !status.connected && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg">2. Connect @tathastukeepsakes</h2>
          <p className="text-sm text-muted">
            You will sign in with Instagram and grant Insights + comments. Tokens stay on the server (service-role
            table). Redirect URI must match Meta exactly: {status.redirectUri}
          </p>
          <a
            href="/api/admin/instagram/connect"
            className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-600"
          >
            <Link2 className="w-4 h-4" />
            Connect Instagram
          </a>
        </section>
      )}

      {dashboard && (
        <>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Handle" value={`@${dashboard.profile.username}`} />
            <StatCard label="Followers" value={dashboard.profile.followersCount ?? '—'} />
            <StatCard label="Following" value={dashboard.profile.followsCount ?? '—'} />
            <StatCard label="Media" value={dashboard.profile.mediaCount ?? '—'} />
          </section>

          {dashboard.insights.length > 0 && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Account insights (last day Meta will give)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {dashboard.insights.map((row) => (
                  <div key={`${row.name}-${row.period}`}>
                    <p className="text-xs uppercase tracking-wide text-muted">{formatInsightName(row.name)}</p>
                    <p className="text-xl font-semibold text-ink">{row.value.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg">Recent posts + comments</h2>
              <button
                type="button"
                onClick={() => void handleDisconnect()}
                disabled={busy}
                className="inline-flex items-center gap-2 text-sm text-red-700 hover:underline"
              >
                <Unplug className="w-4 h-4" />
                Disconnect
              </button>
            </div>
            {dashboard.media.length === 0 && <p className="text-muted text-sm">No media returned.</p>}
            {dashboard.media.map((post) => (
              <article key={post.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex gap-4">
                  {post.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnailUrl}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">
                      {post.mediaType}
                      {post.timestamp ? ` · ${new Date(post.timestamp).toLocaleString('en-IN')}` : ''}
                    </p>
                    <p className="text-sm text-ink mt-1 line-clamp-3">{post.caption || '(no caption)'}</p>
                    <p className="text-xs text-muted mt-2">
                      {post.likeCount ?? '—'} likes · {post.commentsCount ?? post.comments.length} comments
                      {post.permalink && (
                        <>
                          {' · '}
                          <a href={post.permalink} className="text-brand underline" target="_blank" rel="noreferrer">
                            Open on Instagram
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 border-t border-gray-100 pt-3">
                  {post.comments.length === 0 && (
                    <li className="text-sm text-muted">No comments on this post.</li>
                  )}
                  {post.comments.map((comment) => (
                    <li key={comment.id} className="text-sm">
                      <p>
                        <span className="font-medium">@{comment.username}</span> {comment.text}
                      </p>
                      <div className="mt-2 flex flex-col sm:flex-row gap-2">
                        <label className="sr-only" htmlFor={`reply-${comment.id}`}>
                          Reply to @{comment.username}
                        </label>
                        <input
                          id={`reply-${comment.id}`}
                          value={replyDrafts[comment.id] || ''}
                          onChange={(event) =>
                            setReplyDrafts((prev) => ({ ...prev, [comment.id]: event.target.value }))
                          }
                          maxLength={300}
                          placeholder="Reply as Tathastu…"
                          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          disabled={busy || !(replyDrafts[comment.id] || '').trim()}
                          onClick={() => void handleReply(comment.id)}
                          className="inline-flex items-center justify-center gap-2 bg-brand text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Reply
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="text-xl font-semibold text-ink mt-1">{value}</p>
    </div>
  )
}
