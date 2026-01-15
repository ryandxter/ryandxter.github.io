import { hashNewPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ensureAdminSeeded, updateAdminPasswordHash, getAdmin } from "@/lib/admin-credentials"

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
    // Persist new hash into DB-backed admin credential
    await ensureAdminSeeded()
    const admin = await getAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Failed to seed admin credential" }, { status: 500 })
    }

    const { success, error: updateError } = await updateAdminPasswordHash(newHash)

    if (!success) {
      return NextResponse.json({ error: updateError || "Failed to update admin password" }, { status: 500 })
    }
    // Revoke all existing sessions so clients must re-authenticate
    try {
      const { revokeAllAdminSessions } = await import("@/lib/admin-sessions")
      await revokeAllAdminSessions()
    } catch (e) {
      console.warn("Failed to revoke sessions after password change", e)
    }

    console.log("New password hash persisted to DB for admin and sessions revoked")

    return NextResponse.json({
      success: true,
      message: "Password updated and persisted to database. All sessions revoked; re-login required.",
      newHash,
    })
  } catch (error) {
    return NextResponse.json({ error: "Password change failed" }, { status: 500 })
  }
}
