import crypto from "crypto"

const DEFAULT_PASSWORD = "admin123"
const ADMIN_PASSWORD_HASH = hashPassword(DEFAULT_PASSWORD)

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export function verifyPassword(password: string, hash: string): boolean {
  const calculatedHash = hashPassword(password)
  console.log("verifyPassword debug:")
  console.log("  Input password:", password)
  console.log("  Calculated hash:", calculatedHash)
  console.log("  Stored hash:", hash)
  console.log("  Match:", calculatedHash === hash)
  return calculatedHash === hash
}

export function getInitialPasswordHash(): string {
  return ADMIN_PASSWORD_HASH
}

export function hashNewPassword(password: string): string {
  return hashPassword(password)
}

export const DEFAULT_ADMIN_PASSWORD = DEFAULT_PASSWORD
