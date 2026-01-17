"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PasswordModalProps {
  isOpen: boolean
  onAuthenticate: (token: string) => void
  onError: (error: string) => void
}

export function PasswordModal({ isOpen, onAuthenticate, onError }: PasswordModalProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok && data.sessionToken) {
        setPassword("")
        onAuthenticate(data.sessionToken)
      } else {
        const errorMsg = data.error || "Invalid password"
        setError(errorMsg)
        onError(errorMsg)
      }
    } catch (err) {
      const errorMsg = "Authentication failed"
      setError(errorMsg)
      onError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendReset = async () => {
    setError(null)
    setInfo(null)
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to request reset link")
      } else {
        if (data.token) {
          // SMTP not configured — return token for dev use
          setInfo(`Reset token (dev): ${data.token}`)
        } else {
          setInfo(data.message || `Reset link sent to your personal email`)
        }
      }
    } catch (err) {
      setError("Failed to contact server")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Enter password to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {info && <p className="text-sm text-green-600 break-words">{info}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Unlock Dashboard"}
            </Button>
            <Button type="button" variant="ghost" className="w-full mt-2" onClick={handleSendReset} disabled={isLoading}>
              Send reset link to personal email
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
