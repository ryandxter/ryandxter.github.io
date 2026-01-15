import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // require admin session
  const token = (request as any).headers?.get?.("x-admin-session") || (request as any).headers?.get?.("authorization")?.replace(/^Bearer\s+/i, "")
  const { validateAdminToken } = await import("@/lib/admin-sessions")
  const valid = await validateAdminToken(token)
  if (!valid) return NextResponse.json({ error: "Missing or invalid admin session" }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()
    const { label, href } = body

    if (!label || !href) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from("social_links").update({ label, href }).eq("id", id).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update social link" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // require admin session
  const token = (request as any).headers?.get?.("x-admin-session") || (request as any).headers?.get?.("authorization")?.replace(/^Bearer\s+/i, "")
  const { validateAdminToken } = await import("@/lib/admin-sessions")
  const valid = await validateAdminToken(token)
  if (!valid) return NextResponse.json({ error: "Missing or invalid admin session" }, { status: 401 })

  try {
    const { id } = await params
    const supabase = await createClient()
    const { error } = await supabase.from("social_links").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete social link" }, { status: 500 })
  }
}
