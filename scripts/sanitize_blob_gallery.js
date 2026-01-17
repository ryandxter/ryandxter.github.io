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
  } catch (e) {
    // ignore
  }
}

// Try to load .env.local if present so script can run without extra deps
loadEnvFile(process.env.DOTENV_PATH || '.env.local')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env or .env.local. Aborting.')
  process.exit(1)
}

const fetch = global.fetch || require('node-fetch')

async function main() {
  console.log('Scanning gallery_images for blob: URLs via Supabase REST...')

  const pattern = encodeURIComponent('blob:%')
  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/gallery_images?image_url=like.${pattern}&select=*`

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    Accept: 'application/json',
  }

  const res = await fetch(url, { headers })
  if (!res.ok) {
    const txt = await res.text()
    console.error('Error querying Supabase REST:', res.status, txt)
    process.exit(1)
  }

  const data = await res.json()
  if (!data || data.length === 0) {
    console.log('No blob: entries found.')
    process.exit(0)
  }

  console.log(`Found ${data.length} blob: entries. Replacing with /placeholder.jpg`)

  for (const row of data) {
    try {
      const updateUrl = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/gallery_images?id=eq.${encodeURIComponent(row.id)}`
      const upd = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ image_url: '/placeholder.jpg' }),
      })
      if (!upd.ok) {
        const txt = await upd.text()
        console.error('Failed to update', row.id, upd.status, txt)
      } else {
        const out = await upd.json()
        console.log('Updated', row.id, '->', out[0] && out[0].image_url)
      }
    } catch (e) {
      console.error('Error updating row', row.id, e.message || e)
    }
  }

  console.log('Sanitization run complete.')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
