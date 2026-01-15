import { createClient } from "@/lib/supabase/server"
import { getInitialPasswordHash } from "./auth"

export async function getAdmin(username = "admin") {
  const supabase = await createClient()
  const { data, error } = await supabase.from("admin_credentials").select("*").eq("username", username).single()
  if (error) return null
  return data
}

export async function ensureAdminSeeded(username = "admin") {
  const supabase = await createClient()
  const { data: existing } = await supabase.from("admin_credentials").select("id").limit(1)
  if (existing && existing.length > 0) return true

  const initialHash = process.env.ADMIN_PASSWORD_HASH || getInitialPasswordHash()
  const { error } = await supabase.from("admin_credentials").insert([{ username, password_hash: initialHash }])
  return !error
}

export async function updateAdminPasswordHash(newHash: string, username = "admin") {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_credentials")
    .update({ password_hash: newHash, updated_at: new Date().toISOString() })
    .eq("username", username)
    .select()

  if (error) return { success: false, error: error.message }
  return { success: true, data: data?.[0] }
}
