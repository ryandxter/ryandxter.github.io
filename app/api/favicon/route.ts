import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/x-icon", "image/vnd.microsoft.icon", "image/png"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use .ico or .png" }, { status: 400 })
    }

    // Validate file size (max 100KB)
    if (file.size > 100 * 1024) {
      return NextResponse.json({ error: "File size exceeds 100KB limit" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public folder
    const publicPath = join(process.cwd(), "public")
    const filename = file.type.includes("png") ? "apple-touch-icon.png" : "favicon.ico"
    const filepath = join(publicPath, filename)

    try {
      await mkdir(publicPath, { recursive: true })
    } catch (err) {
      // Directory might already exist
    }

    await writeFile(filepath, buffer)

    return NextResponse.json({
      success: true,
      message: `Favicon uploaded successfully as ${filename}`,
      filename,
    })
  } catch (error) {
    console.error("Favicon upload error:", error)
    return NextResponse.json({ error: "Failed to upload favicon" }, { status: 500 })
  }
}
