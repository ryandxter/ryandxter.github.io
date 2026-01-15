import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function createResetToken(ttlMinutes = 60) {
  const token = crypto.randomBytes(24).toString("hex")
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_password_resets")
    .insert([{ token_hash: tokenHash, expires_at: expiresAt }])
    .select()

  if (error) return { success: false, error: error.message }
  return { success: true, token, data: data?.[0] }
}

export async function verifyAndConsumeResetToken(token: string) {
  const tokenHash = hashToken(token)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_password_resets")
    .select("*")
    .eq("token_hash", tokenHash)
    .limit(1)
    .single()

  if (error || !data) return { success: false, error: error?.message || "Invalid token" }
  if (data.used) return { success: false, error: "Token already used" }
  if (new Date(data.expires_at).getTime() < Date.now()) return { success: false, error: "Token expired" }

  // mark used
  const { error: updateError } = await supabase.from("admin_password_resets").update({ used: true }).eq("id", data.id)
  if (updateError) return { success: false, error: updateError.message }
  return { success: true, data }
}
