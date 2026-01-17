#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function loadEnvFile(file) {
  try {
    const abs = path.resolve(file)
    if (!fs.existsSync(abs)) return
    const content = fs.readFileSync(abs, 'utf8')
    for (const line of content.split(/\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(?:"([^"]*)"|'([^']*)'|(.*))\s*$/i)
      if (m) {
        const key = m[1]
        const val = m[2] ?? m[3] ?? m[4] ?? ''
        if (process.env[key] === undefined) process.env[key] = val
      }
    }
  } catch (e) {}
}

loadEnvFile(process.env.DOTENV_PATH || '.env.local')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env or .env.local. Aborting.')
  process.exit(1)
}

const fetch = global.fetch || require('node-fetch')

async function fetchAllRows() {
  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/gallery_images?select=*&order=created_at.asc`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
  if (!res.ok) throw new Error(`Failed to fetch rows: ${res.status}`)
  return res.json()
}

async function deleteRow(id) {
  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/gallery_images?id=eq.${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: 'DELETE', headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
  return res.ok
}

function isBlob(url) {
  return typeof url === 'string' && url.startsWith('blob:')
}

function isSupabaseUrl(url) {
  if (!url || typeof url !== 'string') return false
  return url.includes(SUPABASE_URL.replace(/^https?:\/\//,'')) || url.includes('/storage/v1') || url.includes('/object/public')
}

async function main() {
  console.log('Fetching gallery rows...')
  const rows = await fetchAllRows()
  console.log(`Total rows: ${rows.length}`)

  const byUrl = new Map()
  for (const r of rows) {
    const key = r.image_url || '__NULL__'
    if (!byUrl.has(key)) byUrl.set(key, [])
    byUrl.get(key).push(r)
  }

  const blobRows = rows.filter(r => isBlob(r.image_url))
  const duplicateGroups = [...byUrl.entries()].filter(([k, v]) => k !== '__NULL__' && v.length > 1)

  console.log(`Found ${blobRows.length} blob: rows`)
  console.log(`Found ${duplicateGroups.length} duplicate image groups`)

  // Report cache status
  const cacheReport = { supabase: 0, remote: 0, unknown: 0 }
  for (const [url, list] of byUrl.entries()) {
    if (url === '__NULL__') { cacheReport.unknown += list.length; continue }
    if (isBlob(url)) { cacheReport.unknown += list.length; continue }
    if (isSupabaseUrl(url)) cacheReport.supabase += list.length
    else cacheReport.remote += list.length
  }
  console.log('Cache report:', cacheReport)

  // Collect IDs to delete: all blob rows + duplicate rows except first per group
  const toDelete = new Set()
  for (const r of blobRows) toDelete.add(r.id)
  for (const [url, list] of duplicateGroups) {
    // keep the earliest by created_at if available, else keep first
    list.sort((a,b)=> new Date(a.created_at || 0) - new Date(b.created_at || 0))
    const keep = list[0].id
    for (let i=1;i<list.length;i++) toDelete.add(list[i].id)
    console.log(`Duplicate group: ${url} -> keeping ${keep}, deleting ${list.length-1} rows`)
  }

  if (toDelete.size === 0) {
    console.log('No rows to delete.')
    return
  }

  console.log(`Preparing to delete ${toDelete.size} rows (force).`)

  for (const id of toDelete) {
    try {
      const ok = await deleteRow(id)
      console.log(`${ok ? 'Deleted' : 'Failed'}: ${id}`)
    } catch (e) {
      console.error('Error deleting', id, e.message || e)
    }
  }

  console.log('Cleanup complete.')
}

main().catch(err=>{ console.error('Fatal:', err); process.exit(1) })
