import { hashNewPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

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

    // In a real app, you'd save this to your database
    // For now, we'll just return success (user needs to update env var in dashboard)
    console.log("New password hash:", newHash)

    return NextResponse.json({
      success: true,
      message: "Password updated. Please update ADMIN_PASSWORD_HASH in your environment variables.",
      newHash,
    })
  } catch (error) {
    return NextResponse.json({ error: "Password change failed" }, { status: 500 })
  }
}
