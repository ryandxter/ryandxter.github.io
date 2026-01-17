import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export const config = {
  api: {
    bodyParser: true,
  },
}

async function getServiceClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for server operations")
  }

  return createSupabaseClient(SUPABASE_URL, SERVICE_KEY)
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const items = Array.isArray(body) ? body : body?.items || []
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Expected JSON array of { url, row_number?, position? }" }, { status: 400 })
    }

    const sa = await getServiceClient()
    const bucket = sa.storage.from("gallery")

    const results: any[] = []

    for (const it of items) {
      const url = it?.url || it?.image_url
      const row = it?.row_number ?? it?.row ?? null
      const position = it?.position ?? 0

      if (!url) {
        results.push({ ok: false, url: null, reason: "missing url" })
        continue
      }

      try {
        const res = await fetch(url)
        if (!res.ok) {
          results.push({ ok: false, url, reason: `fetch failed: ${res.status}` })
          continue
        }

        const contentType = res.headers.get("content-type") || "image/jpeg"
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg"
        const buffer = Buffer.from(await res.arrayBuffer())
        const filename = `gallery-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

        const { error: uploadErr } = await bucket.upload(filename, buffer, {
          contentType,
          cacheControl: "public, max-age=31536000, immutable",
          upsert: false,
        })

        if (uploadErr) {
          results.push({ ok: false, url, reason: "upload failed", detail: uploadErr.message })
          continue
        }

        const { data } = bucket.getPublicUrl(filename)

        let inserted: any = null
        if (row != null) {
          try {
            const server = await createClient()
            const { data: insertData, error: insertErr } = await server
              .from("gallery_images")
              .insert([{ row_number: row, image_url: data.publicUrl, position }])
              .select()

            if (insertErr) {
              console.warn("Failed to insert gallery_images row:", insertErr.message)
            } else {
              inserted = insertData?.[0] ?? null
            }
          } catch (e) {
            console.warn("gallery table insert skipped or failed:", e)
          }
        }

        results.push({ ok: true, url, publicUrl: data.publicUrl, record: inserted })
      } catch (e: any) {
        results.push({ ok: false, url, reason: String(e) })
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error("POST /api/uploads/gallery/import error", err)
    return NextResponse.json({ error: "Failed to import" }, { status: 500 })
  }
}
