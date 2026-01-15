import { hashNewPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both passwords required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Verify current password
    const storedHash =
      process.env.ADMIN_PASSWORD_HASH || "e7cf3ef4f17c3999a94f2c6f612e8a888e5b1026878e4e19398b23dd3f592622"
    const crypto = require("crypto")
    const currentHash = crypto.createHash("sha256").update(currentPassword).digest("hex")

    if (currentHash !== storedHash) {
      return NextResponse.json({ error: "Invalid current password" }, { status: 401 })
    }

    // Hash new password
    const newHash = hashNewPassword(newPassword)
    // Attempt to persist to local .env.local when running in non-production environments
    let persisted = false
    let persistError: string | null = null

    try {
      const isProd = process.env.NODE_ENV === "production"
      if (!isProd) {
        const envPath = path.join(process.cwd(), ".env.local")
        try {
          let content = ""
          try {
            content = await fs.readFile(envPath, { encoding: "utf8" })
          } catch (e) {
            // file may not exist; we'll create it
            content = ""
          }

          const line = `ADMIN_PASSWORD_HASH=\"${newHash}\"`

          if (/^ADMIN_PASSWORD_HASH=/m.test(content)) {
            // replace existing line
            content = content.replace(/^ADMIN_PASSWORD_HASH=.*$/m, line)
          } else {
            if (content.length && !content.endsWith("\n")) content += "\n"
            content += line + "\n"
          }

          await fs.writeFile(envPath, content, { encoding: "utf8" })
          persisted = true
        } catch (writeErr: any) {
          persistError = writeErr?.message || String(writeErr)
        }
      }
    } catch (err: any) {
      persistError = err?.message || String(err)
    }

    console.log("New password hash:", newHash, "persisted:", persisted, "err:", persistError)

    return NextResponse.json({
      success: true,
      message: persisted
        ? "Password updated and persisted to .env.local (development)."
        : "Password hashed. Update ADMIN_PASSWORD_HASH in your environment variables.",
      newHash,
      persisted,
      persistError,
    })
  } catch (error) {
    return NextResponse.json({ error: "Password change failed" }, { status: 500 })
  }
}
