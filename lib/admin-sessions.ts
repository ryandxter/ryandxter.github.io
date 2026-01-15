import { createClient } from "@/lib/supabase/server"

export async function createAdminSession(token: string, username = "admin", expiresAtISO: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_sessions")
    .insert([{ token, username, expires_at: expiresAtISO }])
    .select()

  if (error) return { success: false, error: error.message }
  return { success: true, data: data?.[0] }
}

export async function getAdminSessionByToken(token: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("*")
    .eq("token", token)
    .limit(1)
    .single()

  if (error) return null
  return data
}

export async function validateAdminToken(token: string) {
  if (!token) return null
  const session = await getAdminSessionByToken(token)
  if (!session) return null
  if (session.revoked) return null
  if (new Date(session.expires_at).getTime() < Date.now()) return null
  return session
}

export async function revokeAllAdminSessions(username = "admin") {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_sessions")
    .update({ revoked: true })
    .eq("username", username)

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function revokeSessionByToken(token: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("admin_sessions").update({ revoked: true }).eq("token", token).select()
  if (error) return { success: false, error: error.message }
  return { success: true, data }
}
