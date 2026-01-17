import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

export async function POST(request: Request) {
  try {
    const file = await parseFormData(request)
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `og-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`

    const supabase = await createClient()
    const bucket = supabase.storage.from("og-images")
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
    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error("POST /api/uploads/og-image error", err)
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 })
  }
}
