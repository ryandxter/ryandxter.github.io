import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("portfolio_info").select("*").single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch portfolio info" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { name, title, email, location, bio } = body

    if (!name || !title || !email || !location || !bio) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get existing record id
    const { data: existingData, error: fetchError } = await supabase
      .from("portfolio_info")
      .select("id")
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const { data, error } = await supabase
      .from("portfolio_info")
      .update({
        name,
        title,
        email,
        location,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingData.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update portfolio info" }, { status: 500 })
  }
}

