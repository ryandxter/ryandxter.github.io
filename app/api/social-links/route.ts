import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("social_links").select("*").order("label", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch social links" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // require admin session
  const token = (request as any).headers?.get?.("x-admin-session") || (request as any).headers?.get?.("authorization")?.replace(/^Bearer\s+/i, "")
  const { validateAdminToken } = await import("@/lib/admin-sessions")
  const valid = await validateAdminToken(token)
  if (!valid) return NextResponse.json({ error: "Missing or invalid admin session" }, { status: 401 })

  try {
    const body = await request.json()
    const { label, href } = body

    if (!label || !href) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from("social_links").insert([{ label, href }]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create social link" }, { status: 500 })
  }
}
