const SESSION_KEY = "adminSessionToken"
const EXPIRY_KEY = "adminSessionExpiry"

export function setAdminSession(token: string, expiresAt: number) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, token)
    sessionStorage.setItem(EXPIRY_KEY, expiresAt.toString())
  }
}

export function getAdminSession(): string | null {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem(SESSION_KEY)
    const expiry = sessionStorage.getItem(EXPIRY_KEY)

    if (token && expiry && Date.now() < Number.parseInt(expiry)) {
      return token
    }

    clearAdminSession()
  }
  return null
}

export function clearAdminSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(EXPIRY_KEY)
  }
}

export function isSessionExpired(): boolean {
  if (typeof window !== "undefined") {
    const expiry = sessionStorage.getItem(EXPIRY_KEY)
    if (expiry && Date.now() >= Number.parseInt(expiry)) {
      clearAdminSession()
      return true
    }
  }
  return false
}
