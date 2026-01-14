import crypto from "crypto"

const DEFAULT_PASSWORD = "admin123"
const ADMIN_PASSWORD_HASH = hashPassword(DEFAULT_PASSWORD)

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function getInitialPasswordHash(): string {
  return ADMIN_PASSWORD_HASH
}

export function hashNewPassword(password: string): string {
  return hashPassword(password)
}
