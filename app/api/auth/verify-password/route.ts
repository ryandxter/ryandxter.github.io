import { verifyPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { ensureAdminSeeded, getAdmin } from "@/lib/admin-credentials"
import { createAdminSession } from "@/lib/admin-sessions"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 })
    }

    // Ensure an admin credential exists in DB (seed if necessary)
    await ensureAdminSeeded()
    const admin = await getAdmin()
    const storedHash = admin?.password_hash

    console.log("Password verification attempt:")
    console.log("Received password:", password)
    console.log("Stored hash (from DB):", !!storedHash)

    if (!storedHash) {
      return NextResponse.json({ error: "No admin credential configured" }, { status: 500 })
    }

    const isValid = verifyPassword(password, storedHash)

    if (isValid) {
      // Create session token valid for 2 minutes and persist server-side
      const sessionToken = crypto.randomBytes(32).toString("hex")
      const expiresAt = Date.now() + 2 * 60 * 1000 // 2 minutes

      const expiresISO = new Date(expiresAt).toISOString()
      await createAdminSession(sessionToken, "admin", expiresISO)

      return NextResponse.json({ success: true, sessionToken, expiresAt }, { status: 200 })
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
