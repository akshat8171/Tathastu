#!/usr/bin/env bash
# Sync local CSV map → JSON + workflow Code node + live n8n DB.
# Supports multiple media_ids / reel_urls per product row, separated by |.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CSV_PATH="${ROOT_DIR}/config/reel-message-map.csv"
SHEET_ID="${REEL_MAP_SHEET_ID:-1YMRtxyWcCj3zol2vgh-6Ht7byDEoS6eoTkT4JyaB_l4}"

if [[ ! -f "${CSV_PATH}" ]]; then
  echo "Missing ${CSV_PATH}"
  exit 1
fi

export ROOT_DIR
python3 <<'PY'
import csv, json, sqlite3, uuid, os, re
from pathlib import Path

root = Path(os.environ["ROOT_DIR"])
csv_path = root / "config" / "reel-message-map.csv"
settings_path = root / "config" / "settings.csv"
json_path = root / "config" / "reel-message-map.json"
workflow_file = root / "workflows" / "auto-insta-dm.json"
db_path = Path.home() / ".n8n" / "database.sqlite"
workflow_id = "OHQbezysD1WPN878"

SHORTCODE_RE = re.compile(r"instagram\.com/(?:reel|p|tv)/([A-Za-z0-9_-]+)", re.I)


def parse_bool(v, default=True):
    if v is None or str(v).strip() == "":
        return default
    return str(v).strip().lower() in {"1", "true", "yes", "y"}


def split_pipe(value: str):
    return [p.strip() for p in str(value or "").split("|") if p.strip()]


def shortcodes_from(value: str):
    out = []
    for part in split_pipe(value):
        m = SHORTCODE_RE.search(part)
        if m:
            out.append(m.group(1))
        elif re.fullmatch(r"[A-Za-z0-9_-]+", part) and not part.isdigit():
            out.append(part)
    return out


def media_ids_from(value: str):
    ids = []
    for part in split_pipe(value):
        if part.isdigit():
            ids.append(part)
        else:
            m = SHORTCODE_RE.search(part)
            if not m and re.fullmatch(r"\d+", part):
                ids.append(part)
    return ids


settings = {
    "publicCommentReply": "Please check your DM",
    "messagePickMode": "first",
    "ignoreOwnComments": True,
    "ignoreEmptyComments": True,
    "dedupeWindowMinutes": 60,
    "prependReelLink": True,
}
if settings_path.exists():
    with settings_path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            key = (row.get("key") or "").strip()
            val = (row.get("value") or "").strip()
            if key == "public_comment_reply":
                settings["publicCommentReply"] = val or settings["publicCommentReply"]
            elif key == "message_pick_mode":
                settings["messagePickMode"] = val or "first"
            elif key == "ignore_own_comments":
                settings["ignoreOwnComments"] = parse_bool(val, True)
            elif key == "ignore_empty_comments":
                settings["ignoreEmptyComments"] = parse_bool(val, True)
            elif key == "dedupe_window_minutes":
                try:
                    settings["dedupeWindowMinutes"] = int(val)
                except ValueError:
                    pass
            elif key == "prepend_reel_link":
                settings["prependReelLink"] = parse_bool(val, True)

reels = []
with csv_path.open(newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        enabled_raw = (row.get("enabled") or "").strip()
        # If product name was pasted into enabled column, treat as enabled + name
        if enabled_raw and enabled_raw.upper() not in {"TRUE", "FALSE", "1", "0", "YES", "NO", "Y", "N"}:
            reel_name = enabled_raw
            enabled = True
        else:
            reel_name = (row.get("reel_name") or "").strip()
            enabled = parse_bool(enabled_raw, True)

        media_ids = media_ids_from(row.get("media_id") or "")
        urls = split_pipe(row.get("reel_url") or "")
        codes = shortcodes_from(row.get("reel_url") or "")
        msg = (row.get("dm_message") or "").strip()
        if not reel_name:
            reel_name = media_ids[0] if media_ids else (codes[0] if codes else "")
        if not reel_name and not media_ids and not codes:
            continue
        if not msg:
            continue
        reels.append({
            "name": reel_name,
            "mediaIds": media_ids,
            "mediaId": media_ids[0] if media_ids else "",
            "shortcodes": codes,
            "reelUrls": urls,
            "enabled": enabled,
            "messages": [msg],
            "notes": (row.get("notes") or "").strip(),
        })

payload = {
    "_readme": "Generated from config/reel-message-map.csv. Multiple reels/posts per product: separate media_id or reel_url values with |",
    "settings": settings,
    "reels": reels,
}
json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Wrote {json_path} ({len(reels)} products)")

map_literal = json.dumps({
    "settings": settings,
    "reels": [
        {
            "name": r["name"],
            "mediaIds": r["mediaIds"],
            "shortcodes": r["shortcodes"],
            "reelUrls": r.get("reelUrls") or [],
            "enabled": r["enabled"],
            "messages": r["messages"],
        }
        for r in reels
    ],
}, ensure_ascii=False)

js = f'''const fs = require('fs');

function parseCsv(text) {{
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {{
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {{
      if (ch === '"' && next === '"') {{ cell += '"'; i++; continue; }}
      if (ch === '"') {{ inQuotes = false; continue; }}
      cell += ch;
      continue;
    }}
    if (ch === '"') {{ inQuotes = true; continue; }}
    if (ch === ',') {{ row.push(cell); cell = ''; continue; }}
    if (ch === '\\n' || ch === '\\r') {{
      if (ch === '\\r' && next === '\\n') i++;
      row.push(cell); cell = '';
      if (row.length > 1 || (row[0] || '') !== '') rows.push(row);
      row = [];
      continue;
    }}
    cell += ch;
  }}
  if (cell.length || row.length) {{ row.push(cell); rows.push(row); }}
  if (!rows.length) return [];
  const headers = rows[0].map((h) => String(h || '').trim());
  return rows.slice(1).map((r) => {{
    const obj = {{}};
    headers.forEach((h, idx) => {{ obj[h] = r[idx] ?? ''; }});
    return obj;
  }});
}}

function parseBool(v, defaultValue = true) {{
  if (v === undefined || v === null || String(v).trim() === '') return defaultValue;
  return ['1', 'true', 'yes', 'y'].includes(String(v).trim().toLowerCase());
}}

function splitPipe(value) {{
  return String(value || '')
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);
}}

function shortcodesFrom(value) {{
  const out = [];
  const re = /instagram\\.com\\/(?:reel|p|tv)\\/([A-Za-z0-9_-]+)/i;
  for (const part of splitPipe(value)) {{
    const m = part.match(re);
    if (m) out.push(m[1]);
    else if (/^[A-Za-z0-9_-]+$/.test(part) && !/^\\d+$/.test(part)) out.push(part);
  }}
  return out;
}}

function mediaIdsFrom(value) {{
  return splitPipe(value).filter((p) => /^\\d+$/.test(p));
}}

function normalizeProduct(row) {{
  const enabledRaw = String(row.enabled || '').trim();
  let enabled = true;
  let name = String(row.reel_name || '').trim();
  if (enabledRaw && !['TRUE','FALSE','1','0','YES','NO','Y','N'].includes(enabledRaw.toUpperCase())) {{
    name = enabledRaw;
    enabled = true;
  }} else {{
    enabled = parseBool(enabledRaw, true);
  }}
  const mediaIds = mediaIdsFrom(row.media_id);
  const shortcodes = shortcodesFrom(row.reel_url);
  const msg = String(row.dm_message || '').trim();
  if (!name) name = mediaIds[0] || shortcodes[0] || '';
  if (!name || !msg) return null;
  return {{
    name,
    mediaIds,
    shortcodes,
    enabled,
    messages: [msg],
  }};
}}

function loadMapFromCsv() {{
  const csvPath = $env.REEL_MAP_CSV_PATH;
  if (!csvPath || !fs.existsSync(csvPath)) return null;
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const settingsPath = $env.REEL_MAP_SETTINGS_PATH;
  const settings = {{
    publicCommentReply: 'Please check your DM',
    messagePickMode: 'first',
    ignoreOwnComments: true,
    ignoreEmptyComments: true,
    dedupeWindowMinutes: 60,
  }};
  if (settingsPath && fs.existsSync(settingsPath)) {{
    for (const row of parseCsv(fs.readFileSync(settingsPath, 'utf8'))) {{
      const key = String(row.key || '').trim();
      const val = String(row.value || '').trim();
      if (key === 'public_comment_reply' && val) settings.publicCommentReply = val;
      if (key === 'message_pick_mode' && val) settings.messagePickMode = val;
      if (key === 'ignore_own_comments') settings.ignoreOwnComments = parseBool(val, true);
      if (key === 'ignore_empty_comments') settings.ignoreEmptyComments = parseBool(val, true);
      if (key === 'dedupe_window_minutes' && val) settings.dedupeWindowMinutes = Number(val) || 60;
      if (key === 'prepend_reel_link') settings.prependReelLink = parseBool(val, true);
    }}
  }}
  if (settings.prependReelLink === undefined) settings.prependReelLink = true;
  const reels = rows.map(normalizeProduct).filter(Boolean);
  return {{ settings, reels }};
}}

const map = loadMapFromCsv() || {map_literal};
if (map.settings && map.settings.prependReelLink === undefined) map.settings.prependReelLink = true;
const event = $input.first().json;
const ownIgUserId = $env.META_IG_USER_ID || '';
const settings = map.settings;
const token = $env.META_PAGE_ACCESS_TOKEN || '';
const graphVersion = $env.META_GRAPH_VERSION || 'v27.0';
const graphHost = 'graph.instagram.com';

if (settings.ignoreEmptyComments && !String(event.commentText || '').trim()) {{
  return [];
}}
if (settings.ignoreOwnComments && ownIgUserId && event.fromUserId === ownIgUserId) {{
  return [];
}}

const staticData = $getWorkflowStaticData('global');
if (!staticData.recentCommentIds) staticData.recentCommentIds = {{}};
if (!staticData.mediaShortcodeCache) staticData.mediaShortcodeCache = {{}};
if (!staticData.mediaPermalinkCache) staticData.mediaPermalinkCache = {{}};
const now = Date.now();
const windowMs = (settings.dedupeWindowMinutes || 60) * 60 * 1000;
for (const [id, ts] of Object.entries(staticData.recentCommentIds)) {{
  if (now - ts > windowMs) delete staticData.recentCommentIds[id];
}}
if (event.commentId && staticData.recentCommentIds[event.commentId]) {{
  return [];
}}

function findByMediaId(mediaId) {{
  const id = String(mediaId || '');
  return (map.reels || []).find(
    (r) => r.enabled !== false && Array.isArray(r.mediaIds) && r.mediaIds.map(String).includes(id)
  );
}}

function findByShortcode(shortcode) {{
  const code = String(shortcode || '');
  return (map.reels || []).find(
    (r) => r.enabled !== false && Array.isArray(r.shortcodes) && r.shortcodes.includes(code)
  );
}}

function linkFromShortcode(code) {{
  if (!code) return '';
  return `https://www.instagram.com/reel/${{code}}/`;
}}

async function resolveMediaLink(mediaId) {{
  const id = String(mediaId || '');
  if (!id) return {{ shortcode: '', permalink: '' }};
  if (staticData.mediaPermalinkCache[id] || staticData.mediaShortcodeCache[id]) {{
    const shortcode = staticData.mediaShortcodeCache[id] || '';
    const permalink = staticData.mediaPermalinkCache[id] || linkFromShortcode(shortcode);
    return {{ shortcode, permalink }};
  }}
  if (!token) return {{ shortcode: '', permalink: '' }};
  try {{
    const info = await this.helpers.httpRequest({{
      method: 'GET',
      url: `https://${{graphHost}}/${{graphVersion}}/${{id}}`,
      qs: {{
        fields: 'id,permalink,shortcode',
        access_token: token,
      }},
      json: true,
      timeout: 10000,
    }});
    let shortcode = info.shortcode || '';
    let permalink = info.permalink || '';
    if (!shortcode && permalink) {{
      const m = String(permalink).match(/instagram\\.com\\/(?:reel|p|tv)\\/([A-Za-z0-9_-]+)/i);
      if (m) shortcode = m[1];
    }}
    if (!permalink && shortcode) permalink = linkFromShortcode(shortcode);
    if (shortcode) staticData.mediaShortcodeCache[id] = shortcode;
    if (permalink) staticData.mediaPermalinkCache[id] = permalink;
    return {{ shortcode, permalink }};
  }} catch (err) {{
    return {{ shortcode: '', permalink: '' }};
  }}
}}

const mediaInfo = await resolveMediaLink(event.mediaId);
let reel = findByMediaId(event.mediaId);
let matchedVia = reel ? 'media_id' : '';
if (!reel && mediaInfo.shortcode) {{
  reel = findByShortcode(mediaInfo.shortcode);
  if (reel) matchedVia = 'shortcode';
}}

if (!reel) {{
  return [{{
    json: {{
      ...event,
      matched: false,
      reason: 'no_reel_mapping'
    }}
  }}];
}}

const messages = Array.isArray(reel.messages) ? reel.messages.filter(Boolean) : [];
if (!messages.length) {{
  return [{{
    json: {{
      ...event,
      matched: false,
      reason: 'empty_messages'
    }}
  }}];
}}

let bodyMessage = messages[0];
const mode = settings.messagePickMode || 'first';
if (mode === 'random') {{
  bodyMessage = messages[Math.floor(Math.random() * messages.length)];
}} else if (mode === 'all') {{
  bodyMessage = messages.join('\\n\\n');
}}

// Prefer the exact reel/post that was commented on.
let reelLink = mediaInfo.permalink || '';
if (!reelLink && mediaInfo.shortcode) {{
  const fromSheet = (reel.reelUrls || []).find((u) => String(u).includes(mediaInfo.shortcode));
  reelLink = fromSheet || linkFromShortcode(mediaInfo.shortcode);
}}
if (!reelLink && Array.isArray(reel.reelUrls) && reel.reelUrls[0]) {{
  reelLink = reel.reelUrls[0];
}}

const prependLink = settings.prependReelLink !== false;
let dmMessage = bodyMessage;
if (prependLink && reelLink) {{
  dmMessage = `${{reelLink}}\\n\\n${{bodyMessage}}`;
}}

if (event.commentId) {{
  staticData.recentCommentIds[event.commentId] = now;
}}

return [{{
  json: {{
    ...event,
    matched: true,
    matchedVia,
    reelName: reel.name,
    reelLink,
    publicCommentReply: settings.publicCommentReply || 'Please check your DM',
    dmMessage,
    graphVersion,
    pageAccessToken: token,
    graphHost
  }}
}}];
'''

# n8n Code node must be async when using await
# Wrap is automatic if top-level await exists in modern n8n; keep await as-is.

wf = json.loads(workflow_file.read_text(encoding="utf-8"))
found = False
for node in wf.get("nodes", []):
    if node.get("id") == "load-and-match" or node.get("name") == "Load Reel Map & Match":
        node.setdefault("parameters", {})["jsCode"] = js
        found = True
        break
if not found:
    raise SystemExit("Load Reel Map & Match node not found in workflow JSON")
# sticky note hint
for node in wf.get("nodes", []):
    if node.get("id") == "note-setup":
        node.setdefault("parameters", {})["content"] = (
            "## Auto Insta DM\\n"
            "Map products in `config/reel-message-map.csv` or Google Sheet.\\n"
            "Multiple reels/posts per product: separate links with `|` in reel_url.\\n"
            "Webhook: `{{WEBHOOK_URL}}/webhook/instagram-comments`"
        )
workflow_file.write_text(json.dumps(wf, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Updated {workflow_file}")

if not db_path.exists():
    print("n8n DB not found; skip live update")
    raise SystemExit(0)

conn = sqlite3.connect(str(db_path))
cur = conn.cursor()
row = cur.execute(
    "SELECT nodes, connections, activeVersionId FROM workflow_entity WHERE id=?",
    (workflow_id,),
).fetchone()
if not row:
    print(f"Workflow {workflow_id} not in n8n DB; import first")
    raise SystemExit(0)

nodes = json.loads(row[0])
for node in nodes:
    if node.get("id") == "load-and-match" or node.get("name") == "Load Reel Map & Match":
        node.setdefault("parameters", {})["jsCode"] = js
        break
nodes_text = json.dumps(nodes, ensure_ascii=False)
connections_text = row[1]
new_version = str(uuid.uuid4())

cur.execute(
    "UPDATE workflow_entity SET nodes=?, updatedAt=STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'), versionId=?, activeVersionId=? WHERE id=?",
    (nodes_text, new_version, new_version, workflow_id),
)
cur.execute(
    "INSERT INTO workflow_history (versionId, workflowId, authors, nodes, connections, name, autosaved, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 0, STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'), STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))",
    (new_version, workflow_id, "sync-reel-map", nodes_text, connections_text, "Auto Insta DM — Comment → Reply + DM"),
)
try:
    cur.execute(
        "UPDATE workflow_published_version SET publishedVersionId=?, updatedAt=STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') WHERE workflowId=?",
        (new_version, workflow_id),
    )
except Exception as e:
    print(f"published version update skipped: {e}")
conn.commit()
conn.close()
print(f"Updated live n8n workflow {workflow_id} → version {new_version}")
print("Toggle workflow Active off/on once if needed.")
PY

echo
echo "Google Sheet: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit"
echo "Local CSV: ${CSV_PATH}"
echo "Tip: one PRODUCT row; multiple links in reel_url separated by |"
