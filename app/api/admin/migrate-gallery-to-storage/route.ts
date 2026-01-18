import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

async function getServiceClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  return createSupabaseClient(SUPABASE_URL, SERVICE_KEY)
}

interface MigrationResult {
  id: string
  row_number: number
  position: number
  originalUrl: string
  newUrl?: string
  status: "success" | "skipped" | "failed"
  reason?: string
}

export async function POST(request: Request) {
  try {
    // Verify admin session (or allow in development)
    const url = new URL(request.url)
    const isDev = process.env.NODE_ENV === "development" || url.searchParams.get("dev") === "1"
    const authHeader = request.headers.get("x-admin-session")

    if (!isDev && !authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const server = await createClient()
    const sa = await getServiceClient()
    const bucket = sa.storage.from("gallery")

    // Fetch all gallery images
    const { data: images, error: fetchErr } = await server
      .from("gallery_images")
      .select("*")
      .order("row_number")
      .order("position")

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ message: "No gallery images to migrate", results: [] })
    }

    const results: MigrationResult[] = []

    for (const image of images) {
      const result: MigrationResult = {
        id: image.id,
        row_number: image.row_number,
        position: image.position,
        originalUrl: image.image_url,
        status: "failed",
      }

      try {
        // Skip if already a Supabase storage URL
        if (image.image_url?.includes(SUPABASE_URL)) {
          result.status = "skipped"
          result.reason = "Already in storage"
          results.push(result)
          continue
        }

        // Skip blob/data URLs
        if (image.image_url?.startsWith("blob:") || image.image_url?.startsWith("data:")) {
          result.status = "skipped"
          result.reason = "Blob/data URL not supported"
          results.push(result)
          continue
        }

        // Fetch the image from original URL
        const fetchRes = await fetch(image.image_url)
        if (!fetchRes.ok) {
          result.reason = `Fetch failed: ${fetchRes.status}`
          results.push(result)
          continue
        }

        const contentType = fetchRes.headers.get("content-type") || "image/jpeg"
        const ext = contentType.includes("png")
          ? "png"
          : contentType.includes("webp")
            ? "webp"
            : contentType.includes("gif")
              ? "gif"
              : "jpg"

        const buffer = Buffer.from(await fetchRes.arrayBuffer())

        // Upload to Supabase storage
        const filename = `gallery-migrate-${image.row_number}-${image.position}-${Date.now()}.${ext}`

        const { error: uploadErr } = await bucket.upload(filename, buffer, {
          contentType,
          cacheControl: "public, max-age=31536000, immutable",
          upsert: false,
        })

        if (uploadErr) {
          result.reason = `Upload failed: ${uploadErr.message}`
          results.push(result)
          continue
        }

        // Get public URL
        const { data: publicData } = bucket.getPublicUrl(filename)
        const newUrl = publicData.publicUrl

        // Update database with new URL
        const { error: updateErr } = await server
          .from("gallery_images")
          .update({ image_url: newUrl })
          .eq("id", image.id)

        if (updateErr) {
          result.reason = `Update failed: ${updateErr.message}`
          results.push(result)
          continue
        }

        result.status = "success"
        result.newUrl = newUrl
        results.push(result)
      } catch (err) {
        result.reason = err instanceof Error ? err.message : "Unknown error"
        results.push(result)
      }
    }

    const successCount = results.filter((r) => r.status === "success").length
    const skipCount = results.filter((r) => r.status === "skipped").length
    const failCount = results.filter((r) => r.status === "failed").length

    return NextResponse.json({
      message: "Migration complete",
      summary: {
        total: results.length,
        success: successCount,
        skipped: skipCount,
        failed: failCount,
      },
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 }
    )
  }
}
