import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const url = request.url
    const search = new URL(url).searchParams
    const fallbackId = search.get("id") || search.get("nxtPid") || null
    const id = params?.id || fallbackId || (() => {
      try {
        const p = new URL(url).pathname
        const parts = p.split("/").filter(Boolean)
        return parts.length ? parts[parts.length - 1] : null
      } catch {
        return null
      }
    })()

    if (!id) {
      console.warn("GET /api/experiences called without id", { url })
      return NextResponse.json({ error: "Missing experience id" }, { status: 400 })
    }
    const supabase = await createClient()
    const { data, error } = await supabase.from("experiences").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const url = request.url
    const search = new URL(url).searchParams
    const fallbackId = search.get("id") || search.get("nxtPid") || null
    const id = params?.id || fallbackId || (() => {
      try {
        const p = new URL(url).pathname
        const parts = p.split("/").filter(Boolean)
        return parts.length ? parts[parts.length - 1] : null
      } catch {
        return null
      }
    })()

    if (!id) {
      console.warn("PUT /api/experiences called without id", { url })
      return NextResponse.json({ error: "Missing experience id" }, { status: 400 })
    }
    // validate admin session for mutating
    const token = (request as any).headers?.get?.("x-admin-session") || (request as any).headers?.get?.("authorization")?.replace(/^Bearer\s+/i, "")
    if (!token) return NextResponse.json({ error: "Missing admin session token" }, { status: 401 })
    const { getAdminSessionByToken } = await import("@/lib/admin-sessions")
    const session = await getAdminSessionByToken(token)
    if (!session || session.revoked || new Date(session.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired admin session" }, { status: 401 })
    }
    const body = await request.json()
    const { company, period, description } = body

    if (!company || !period || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("experiences")
      .update({ company, period, description, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const url = request.url
    const search = new URL(url).searchParams
    const fallbackId = search.get("id") || search.get("nxtPid") || null
    const id = params?.id || fallbackId || (() => {
      try {
        const p = new URL(url).pathname
        const parts = p.split("/").filter(Boolean)
        return parts.length ? parts[parts.length - 1] : null
      } catch {
        return null
      }
    })()

    if (!id) {
      console.warn("DELETE /api/experiences called without id", { url })
      return NextResponse.json({ error: "Missing experience id" }, { status: 400 })
    }
    // validate admin session for mutating
    const token = (request as any).headers?.get?.("x-admin-session") || (request as any).headers?.get?.("authorization")?.replace(/^Bearer\s+/i, "")
    if (!token) return NextResponse.json({ error: "Missing admin session token" }, { status: 401 })
    const { getAdminSessionByToken } = await import("@/lib/admin-sessions")
    const session = await getAdminSessionByToken(token)
    if (!session || session.revoked || new Date(session.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired admin session" }, { status: 401 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from("experiences").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 })
  }
}
