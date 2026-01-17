import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const token = (request as any).headers?.get?.("x-admin-session") || ""
    const { validateAdminToken } = await import("@/lib/admin-sessions")
    const session = await validateAdminToken(token)
    if (!session) return NextResponse.json({ error: "Missing or invalid admin session" }, { status: 401 })

    const supabase = await createClient()

    // Find blob: rows
    const { data: blobRows, error: blobErr } = await supabase.from("gallery_images").select("id,image_url,created_at").like("image_url", "blob:%")
    if (blobErr) return NextResponse.json({ error: blobErr.message }, { status: 500 })

    const deletedIds: string[] = []

    if (blobRows && blobRows.length > 0) {
      const ids = blobRows.map((r: any) => r.id)
      const { error: delErr } = await supabase.from("gallery_images").delete().in("id", ids)
      if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })
      deletedIds.push(...ids)
    }

    // Find duplicates (same image_url) and delete all but earliest
    const { data: allRows, error: allErr } = await supabase.from("gallery_images").select("id,image_url,created_at").order("created_at", { ascending: true })
    if (allErr) return NextResponse.json({ error: allErr.message }, { status: 500 })

    const groups = new Map<string, any[]>()
    for (const r of allRows || []) {
      const key = r.image_url || "__NULL__"
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(r)
    }

    for (const [url, list] of groups.entries()) {
      if (url === "__NULL__") continue
      if (list.length > 1) {
        // keep the earliest (list already sorted by created_at asc)
        const keep = list[0].id
        const toRemove = list.slice(1).map((x) => x.id)
        if (toRemove.length > 0) {
          const { error: delDupErr } = await supabase.from("gallery_images").delete().in("id", toRemove)
          if (delDupErr) return NextResponse.json({ error: delDupErr.message }, { status: 500 })
          deletedIds.push(...toRemove)
        }
      }
    }

    return NextResponse.json({ deletedCount: deletedIds.length, deletedIds }, { headers: { "X-Removed-Blob-Count": String(deletedIds.length) } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
