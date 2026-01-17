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
      return NextResponse.json({ error: "Expected JSON array of import items" }, { status: 400 })
    }

    const sa = await getServiceClient()
    const bucket = sa.storage.from("gallery")
    const server = await createClient()

    const results: any[] = []

    for (const it of items) {
      const action = (it?.action || "create").toLowerCase()
      const url = it?.url || it?.image_url || null
      const id = it?.id ?? null
      const row = it?.row_number ?? it?.row ?? null
      const position = it?.position ?? undefined

      // disallow session blob/data urls
      if (url && (String(url).startsWith("blob:") || String(url).startsWith("data:"))) {
        results.push({ ok: false, action, id, row, url, reason: "disallowed url scheme" })
        continue
      }

      try {
        if (action === "create") {
          if (!url) {
            results.push({ ok: false, action, reason: "missing url for create" })
            continue
          }

          const res = await fetch(url)
          if (!res.ok) {
            results.push({ ok: false, action, url, reason: `fetch failed: ${res.status}` })
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
            results.push({ ok: false, action, url, reason: "upload failed", detail: uploadErr.message })
            continue
          }

          const { data } = bucket.getPublicUrl(filename)

          let inserted: any = null
          try {
            const toInsert: any = { image_url: data.publicUrl }
            if (row != null) toInsert.row_number = row
            if (position !== undefined) toInsert.position = position
            const { data: insertData, error: insertErr } = await server.from("gallery_images").insert([toInsert]).select()
            if (insertErr) {
              console.warn("Failed to insert gallery_images row:", insertErr.message)
            } else {
              inserted = insertData?.[0] ?? null
            }
          } catch (e) {
            console.warn("gallery table insert skipped or failed:", e)
          }

          results.push({ ok: true, action, url, publicUrl: data.publicUrl, record: inserted })
        } else if (action === "update") {
          if (!url) {
            results.push({ ok: false, action, id, row, reason: "missing url for update" })
            continue
          }

          const filter = id ? { id } : row ? { row_number: row } : null
          if (!filter) {
            results.push({ ok: false, action, reason: "missing id or row_number for update" })
            continue
          }

          // fetch existing row to know previous image
          let existingRow: any = null
          try {
            if (filter.id) {
              const r = await server.from("gallery_images").select("id,image_url").eq("id", filter.id).maybeSingle()
              existingRow = r.data ?? null
            } else {
              const r = await server.from("gallery_images").select("id,image_url").eq("row_number", filter.row_number).maybeSingle()
              existingRow = r.data ?? null
            }
          } catch (e) {
            existingRow = null
          }

          // fetch + upload new image
          const res = await fetch(url)
          if (!res.ok) {
            results.push({ ok: false, action, url, reason: `fetch failed: ${res.status}` })
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
            results.push({ ok: false, action, url, reason: "upload failed", detail: uploadErr.message })
            continue
          }

          const { data } = bucket.getPublicUrl(filename)

          // update DB row
          const query = server.from("gallery_images")
          const updater: any = { image_url: data.publicUrl }
          if (position !== undefined) updater.position = position

          let updResp: any
          if (filter.id) {
            updResp = await query.update(updater).eq("id", filter.id).select()
          } else {
            updResp = await query.update(updater).eq("row_number", filter.row_number).select()
          }

          if (updResp.error) {
            results.push({ ok: false, action, reason: "db update failed", detail: updResp.error.message })
            continue
          }

          // remove previous file if present and different
          try {
            const prev = existingRow?.image_url
            if (prev) {
              try {
                const parsed = new URL(prev)
                const parts = parsed.pathname.split("/")
                const prevName = parts[parts.length - 1]
                const newName = filename
                if (prevName && prevName !== newName) {
                  await bucket.remove([prevName]).catch(() => null)
                }
              } catch (e) {
                // ignore
              }
            }
          } catch (e) {
            // ignore
          }

          results.push({ ok: true, action, id, row, publicUrl: data.publicUrl, updated: updResp.data?.[0] ?? null })
        } else if (action === "delete") {
          // delete DB row and storage object
          const filter = id ? { id } : row ? { row_number: row } : null
          if (!filter) {
            results.push({ ok: false, action, reason: "missing id or row_number for delete" })
            continue
          }

          // fetch the row to get image_url
          let fetchResp: any
          if (filter.id) {
            fetchResp = await server.from("gallery_images").select("id,image_url").eq("id", filter.id).maybeSingle()
          } else {
            fetchResp = await server.from("gallery_images").select("id,image_url").eq("row_number", filter.row_number).maybeSingle()
          }

          if (fetchResp.error) {
            results.push({ ok: false, action, reason: "failed to fetch row", detail: fetchResp.error.message })
            continue
          }

          const rowData = fetchResp.data ?? null
          if (rowData?.image_url) {
            // extract filename from public url
            try {
              const parsed = new URL(rowData.image_url)
              const parts = parsed.pathname.split("/")
              const name = parts[parts.length - 1]
              if (name) {
                await bucket.remove([name]).catch(() => null)
              }
            } catch (e) {
              // ignore
            }
          }

          // delete DB row
          let delResp: any
          if (filter.id) {
            delResp = await server.from("gallery_images").delete().eq("id", filter.id)
          } else {
            delResp = await server.from("gallery_images").delete().eq("row_number", filter.row_number)
          }

          if (delResp.error) {
            results.push({ ok: false, action, reason: "db delete failed", detail: delResp.error.message })
            continue
          }

          results.push({ ok: true, action, id, row })
        } else {
          results.push({ ok: false, action, reason: "unknown action" })
        }
      } catch (e: any) {
        results.push({ ok: false, action, id, row, url, reason: String(e) })
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error("POST /api/uploads/gallery/import error", err)
    return NextResponse.json({ error: "Failed to import" }, { status: 500 })
  }
}
