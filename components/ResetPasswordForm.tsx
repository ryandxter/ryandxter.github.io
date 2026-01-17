"use client"

import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { setAdminSession } from "@/lib/admin-session"

interface Props {
  token?: string
}

export default function ResetPasswordForm({ token = "" }: Props) {
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useSearchParams()
  const resetToken = token || params?.get("token") || ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!resetToken) return setError("Missing reset token")
    if (newPassword.length < 6) return setError("Password too short (min 6)")
    if (newPassword !== confirm) return setError("Passwords do not match")

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/perform-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reset password")

      // verify password to obtain session token
      const verifyRes = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || "Failed to sign in after reset")

      // set client session and redirect to admin
      setAdminSession(verifyData.sessionToken, verifyData.expiresAt)
      setMessage("Password updated — signing you in...")
      setTimeout(() => router.push("/admin"), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Set New Admin Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={isLoading}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Set Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
