import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export const config = {
  api: {
    bodyParser: false,
  },
}

async function parseFormData(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const row = formData.get("row_number") as string | null
  const position = formData.get("position") as string | null
  return { file, row: row ? Number.parseInt(row) : null, position: position ? Number.parseInt(position) : null }
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
    const { file, row, position } = await parseFormData(request)
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`

    const sa = await getServiceClient()
    const bucket = sa.storage.from("gallery")

    const { error: uploadErr } = await bucket.upload(filename, buffer, {
      contentType: file.type || "image/jpeg",
      cacheControl: "public, max-age=31536000, immutable",
      upsert: false,
    })

    if (uploadErr) {
      console.error("Upload error:", uploadErr)
      return NextResponse.json({ error: uploadErr.message }, { status: 500 })
    }

    const { data } = bucket.getPublicUrl(filename)

    // if row/position provided, insert into gallery_images table
    let inserted: any = null
    if (row != null) {
      try {
        const server = await createClient()
        const { data: insertData, error: insertErr } = await server
          .from("gallery_images")
          .insert([
            { row_number: row, image_url: data.publicUrl, position: position ?? 0 },
          ])
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

    return NextResponse.json({ url: data.publicUrl, record: inserted })
  } catch (err) {
    console.error("POST /api/uploads/gallery error", err)
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 })
  }
}
