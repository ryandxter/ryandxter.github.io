import { verifyPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 })
    }

    // Get stored password hash from environment or use default
    const storedHash =
      process.env.ADMIN_PASSWORD_HASH || "e7cf3ef4f17c3999a94f2c6f612e8a888e5b1026878e4e19398b23dd3f592622"

    const isValid = verifyPassword(password, storedHash)

    if (isValid) {
      // Create session token valid for 2 minutes
      const sessionToken = crypto.randomBytes(32).toString("hex")
      const expiresAt = Date.now() + 2 * 60 * 1000 // 2 minutes

      return NextResponse.json(
        { success: true, sessionToken, expiresAt },
        {
          status: 200,
          headers: {
            "Set-Cookie": `adminSession=${sessionToken}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=120`,
          },
        },
      )
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
