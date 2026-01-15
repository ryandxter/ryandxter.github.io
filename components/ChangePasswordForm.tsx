"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ClipboardCopy } from "lucide-react"

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [newHash, setNewHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)
    setNewHash(null)

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Password change failed")
      } else {
        setMessage(data.message || "Password updated")
        setNewHash(data.newHash || null)
      }
    } catch (err) {
      setError("Failed to contact server")
    } finally {
      setIsLoading(false)
      setCurrentPassword("")
      setNewPassword("")
    }
  }

  const copyHash = async () => {
    if (!newHash) return
    await navigator.clipboard.writeText(newHash)
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold mb-4">Change Admin Password</h2>
      <p className="text-sm text-neutral-600 mb-4">
        Enter your current password and a new password (min 6 chars). The dashboard will return a hashed value — copy it and update
        the `ADMIN_PASSWORD_HASH` environment variable in your deployment platform (Vercel) or in your local `.env.local`.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="New password (min 6 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        {newHash && (
          <div className="flex items-center gap-2 bg-neutral-50 border p-2 rounded">
            <code className="break-all text-sm">{newHash}</code>
            <Button variant="outline" size="sm" onClick={copyHash} className="ml-auto">
              <ClipboardCopy className="w-4 h-4 mr-2" /> Copy hash
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Change Password"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCurrentPassword("")
              setNewPassword("")
              setError(null)
              setMessage(null)
              setNewHash(null)
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}
