import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const config = {
  api: {
    bodyParser: false,
  },
}

async function parseFormData(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null
  return file
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
    const file = await parseFormData(request)
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `og-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`

    const sa = await getServiceClient()
    const bucket = sa.storage.from("og")

    // upload
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

    // attempt to save metadata into og_images table (if it exists)
    try {
      const { error: insertErr } = await sa.from("og_images").insert([
        {
          file_name: filename,
          path: filename,
          public_url: data.publicUrl,
        },
      ])
      if (insertErr) {
        console.warn("Could not insert og_images metadata:", insertErr.message)
      }
    } catch (e) {
      console.warn("og_images table insert skipped or failed:", e)
    }

    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error("POST /api/uploads/og-image error", err)
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sa = await getServiceClient()
    const bucket = sa.storage.from("og")

    const { data: listData, error: listErr } = await bucket.list("", { limit: 100, offset: 0 })
    if (listErr) {
      console.error("List error:", listErr)
      return NextResponse.json({ error: listErr.message }, { status: 500 })
    }

    // map to include public URLs
    const items = (listData || []).map((it: any) => {
      const { data } = bucket.getPublicUrl(it.name)
      return {
        fileName: it.name,
        size: it.size,
        updated_at: it.updated_at,
        publicUrl: data.publicUrl,
      }
    })

    return NextResponse.json({ items })
  } catch (err) {
    console.error("GET /api/uploads/og-image error", err)
    return NextResponse.json({ error: "Failed to list objects" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const fileName = (body && (body.fileName || body.file_name)) || null
    if (!fileName) return NextResponse.json({ error: "Missing fileName in body" }, { status: 400 })

    const sa = await getServiceClient()
    const bucket = sa.storage.from("og-images")

    const { error: removeErr } = await bucket.remove([fileName])
    if (removeErr) {
      console.error("Remove error:", removeErr)
      return NextResponse.json({ error: removeErr.message }, { status: 500 })
    }

    // remove metadata row if exists
    try {
      const { error: delErr } = await sa.from("og_images").delete().eq("file_name", fileName)
      if (delErr) console.warn("Failed to delete og_images row:", delErr.message)
    } catch (e) {
      console.warn("og_images delete skipped or failed:", e)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE /api/uploads/og-image error", err)
    return NextResponse.json({ error: "Failed to delete object" }, { status: 500 })
  }
}
