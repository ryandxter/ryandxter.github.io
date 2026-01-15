import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("experiences").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // protect mutating route
  const token = (request as any).headers?.get?.("x-admin-session") || (request as any).headers?.get?.("authorization")?.replace(/^Bearer\s+/i, "")
  if (!token) return NextResponse.json({ error: "Missing admin session token" }, { status: 401 })
  const { getAdminSessionByToken } = await import("@/lib/admin-sessions")
  const session = await getAdminSessionByToken(token)
  if (!session || session.revoked || new Date(session.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Invalid or expired admin session" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { company, period, description } = body

    if (!company || !period || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from("experiences").insert([{ company, period, description }]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 })
  }
}
