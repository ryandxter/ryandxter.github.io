import { NextResponse } from "next/server"
import { verifyAndConsumeResetToken } from "@/lib/admin-password-resets"
import { hashNewPassword } from "@/lib/auth"
import { updateAdminPasswordHash } from "@/lib/admin-credentials"
import { revokeAllAdminSessions } from "@/lib/admin-sessions"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, newPassword } = body
    if (!token || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Missing token or invalid new password" }, { status: 400 })
    }

    const { success, error } = await verifyAndConsumeResetToken(token)
    if (!success) return NextResponse.json({ error: error || "Invalid or expired token" }, { status: 400 })

    const newHash = hashNewPassword(newPassword)
    const updated = await updateAdminPasswordHash(newHash)
    if (!updated?.success) return NextResponse.json({ error: updated.error || "Failed to update password" }, { status: 500 })

    // revoke sessions to force re-login
    await revokeAllAdminSessions()

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (err) {
    console.error("POST /api/auth/perform-reset error", err)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
