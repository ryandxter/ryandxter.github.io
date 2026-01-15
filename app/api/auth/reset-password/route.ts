import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createResetToken } from "@/lib/admin-password-resets"

async function sendMail(to: string, subject: string, text: string, html?: string) {
  // optional nodemailer support if SMTP env vars are configured
  try {
    const host = process.env.SMTP_HOST
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const from = process.env.SMTP_FROM || `no-reply@${process.env.VERCEL_URL || "example.com"}`
    if (!host || !user || !pass) {
      console.log("SMTP not configured; skipping email send")
      return { ok: false, info: "smtp_not_configured" }
    }

    const nodemailer = await import("nodemailer")
    const transporter = nodemailer.createTransport({ host, auth: { user, pass } })
    const info = await transporter.sendMail({ from, to, subject, text, html })
    return { ok: true, info }
  } catch (err) {
    console.error("Failed to send email", err)
    return { ok: false, info: err }
  }
}

export async function POST() {
  try {
    // ensure we can read the admin contact email from portfolio_info
    const supabase = await createClient()
    const { data: profile, error: profileErr } = await supabase.from("portfolio_info").select("email").single()
    if (profileErr || !profile?.email) {
      return NextResponse.json({ error: "Could not determine admin email" }, { status: 500 })
    }

    const { success, token, error } = await createResetToken(60)
    if (!success) return NextResponse.json({ error: error || "Failed to create token" }, { status: 500 })

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL || "localhost:3000"}`}/admin/reset?token=${token}`
    const subject = "Password reset for your portfolio admin"
    const text = `A password reset was requested. Use this link to reset your admin password: ${resetUrl}`
    const html = `<p>A password reset was requested. Click the link below to reset your admin password (expires in 60 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`

    const mailResult = await sendMail(profile.email, subject, text, html)

    // If SMTP not configured, return the token for manual use (dev mode)
    if (!mailResult.ok) {
      return NextResponse.json({ message: "SMTP not configured; token returned for manual use", token, email: profile.email })
    }

    return NextResponse.json({ message: `Reset link sent to ${profile.email}` })
  } catch (err) {
    console.error("POST /api/auth/reset-password error", err)
    return NextResponse.json({ error: "Failed to process reset request" }, { status: 500 })
  }
}
