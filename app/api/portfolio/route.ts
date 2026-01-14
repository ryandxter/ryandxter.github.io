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

    // Also update the local data/cv-data.ts so meta info reflects latest dashboard settings
    try {
      const fs = await import("fs/promises")
      const path = await import("path")
      const filePath = path.join(process.cwd(), "data", "cv-data.ts")
      let fileContents = await fs.readFile(filePath, "utf8")

      const newPersonalBlock = `personal: {
    name: ${JSON.stringify(name)},
    title: ${JSON.stringify(title)},
    email: ${JSON.stringify(email)},
    location: ${JSON.stringify(location)},
    bio: ${JSON.stringify(bio)},
  },`

      const personalRegex = /personal:\s*{[\s\S]*?},/m

      if (personalRegex.test(fileContents)) {
        fileContents = fileContents.replace(personalRegex, newPersonalBlock)
        await fs.writeFile(filePath, fileContents, "utf8")
        console.log("Updated data/cv-data.ts personal block from dashboard save")
      } else {
        console.warn("Could not find personal block in data/cv-data.ts to update")
      }
    } catch (err) {
      console.error("Failed to update data/cv-data.ts:", err)
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update portfolio info" }, { status: 500 })
  }
}

