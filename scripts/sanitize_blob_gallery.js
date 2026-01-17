#!/usr/bin/env node
const dotenv = require('dotenv')
dotenv.config({ path: process.env.DOTENV_PATH || '.env.local' })

const { createClient } = require('@supabase/supabase-js')

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env. Aborting.')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  console.log('Scanning gallery_images for blob: URLs...')
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .like('image_url', 'blob:%')

  if (error) {
    console.error('Error querying gallery_images:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('No blob: entries found.')
    process.exit(0)
  }

  console.log(`Found ${data.length} blob: entries. Replacing with /placeholder.jpg`)

  const ids = data.map((r) => r.id)

  const updates = ids.map((id) => ({ id, image_url: '/placeholder.jpg' }))

  const { data: updated, error: updateErr } = await supabase
    .from('gallery_images')
    .upsert(updates, { onConflict: 'id' })
    .select('id, image_url')

  if (updateErr) {
    console.error('Failed to update rows:', updateErr.message)
    process.exit(1)
  }

  console.log('Updated rows:')
  updated.forEach((r) => console.log(r.id, '->', r.image_url))
  console.log('Done.')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
