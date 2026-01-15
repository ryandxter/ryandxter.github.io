import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("portfolio_info").select("*").single()

    if (error) {
      console.error("GET /api/portfolio supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("GET /api/portfolio unexpected error:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio info" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    // support both shapes: { title, bio, location } and { career_name, about, availability }
    const name = body.name
    const title = body.title || body.career_name
    const email = body.email
    const location = body.location || body.availability
    const bio = body.bio || body.about

    if (!name || !title || !email || !bio) {
      return NextResponse.json({ error: "Missing required fields (name, title/career_name, email, bio/about)" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get existing record id
    const { data: existingData, error: fetchError } = await supabase.from("portfolio_info").select("id").single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const updateObj: Record<string, any> = { updated_at: new Date().toISOString() }
    updateObj.name = name
    updateObj.email = email
    // set both common column names when available
    updateObj.title = title
    updateObj.career_name = title
    updateObj.bio = bio
    updateObj.about = bio
    if (location) {
      updateObj.location = location
      updateObj.availability = location
    }

    const { data, error } = await supabase.from("portfolio_info").update(updateObj).eq("id", existingData.id).select().single()

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
      location: ${JSON.stringify(location || "")},
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
    console.error("PUT /api/portfolio unexpected error:", error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message || "Failed to update portfolio info" }, { status: 500 })
  }
}

