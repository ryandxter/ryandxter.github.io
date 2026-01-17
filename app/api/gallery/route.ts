import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("row_number", { ascending: true })
      .order("position", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Remove any entries that reference session-scoped object URLs (blob:)
    const sanitized = (data || []).filter((row) => {
      try {
        return !(row.image_url && String(row.image_url).startsWith("blob:"))
      } catch (e) {
        return true
      }
    })

    const removedCount = (data || []).length - sanitized.length

    // Return with aggressive caching for gallery data
    const headers: Record<string, string> = {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "CDN-Cache-Control": "max-age=3600",
      "Expires": new Date(Date.now() + 3600000).toUTCString(),
    }
    if (removedCount > 0) {
      headers["X-Removed-Blob-Count"] = String(removedCount)
    }

    return NextResponse.json(sanitized, { headers })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { row_number, image_url, position } = body

    if (!row_number || !image_url || position === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from("gallery_images").insert([{ row_number, image_url, position }]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create gallery image" }, { status: 500 })
  }
}
