#!/usr/bin/env node
// Usage: SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/create_og_bucket.js

(async () => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
      process.exit(1)
    }

    const listRes = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/buckets`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
    })

    if (!listRes.ok) {
      const txt = await listRes.text()
      console.error('Failed to list buckets:', listRes.status, txt)
      process.exit(1)
    }

    const buckets = await listRes.json()
    const exists = buckets.some((b) => b.id === 'og' || b.name === 'og')

    if (exists) {
      console.log('Bucket og-images already exists')
      // try to ensure it's public by updating it
      const updateRes = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/bucket/og-images`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ public: true }),
      })
      if (!updateRes.ok) {
        const txt = await updateRes.text()
        console.warn('Could not update bucket visibility:', updateRes.status, txt)
      } else {
        console.log('Ensured og-images bucket is public')
      }
      process.exit(0)
    }

    // create bucket
    const body = { id: 'og', name: 'og', public: true }
    const createRes = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/bucket`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!createRes.ok) {
      const txt = await createRes.text()
      console.error('Failed to create bucket:', createRes.status, txt)
      process.exit(1)
    }

    console.log('Created og-images bucket and set it public')
    process.exit(0)
  } catch (err) {
    console.error('Error creating og-images bucket', err)
    process.exit(1)
  }
})()
