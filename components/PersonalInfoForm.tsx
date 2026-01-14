"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PersonalInfo {
  name: string
  title: string
  bio: string
  email: string
  location: string
}

interface PersonalInfoFormProps {
  isLoading?: boolean
}

export function PersonalInfoForm({ isLoading = false }: PersonalInfoFormProps) {
  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchPortfolioInfo = async () => {
      try {
        const response = await fetch("/api/portfolio")
        if (response.ok) {
          const data = await response.json()
          setName(data.name || "")
          setTitle(data.title || "")
          setBio(data.bio || "")
          setEmail(data.email || "")
          setLocation(data.location || "")
        }
      } catch (err) {
        setError("Failed to load personal info")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchPortfolioInfo()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim() || !title.trim() || !bio.trim() || !email.trim() || !location.trim()) {
      setError("All fields are required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title, bio, email, location }),
      })

      if (!response.ok) {
        throw new Error("Failed to update personal info")
      }

      setSuccess("Personal information updated successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingData) {
    return <div className="text-center py-4">Loading personal info...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your name, title, location, email, and bio</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Riansyah Rizky Poetra"
              disabled={isSaving || isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Job Title / Career</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., R&D Photography Videography - System"
              disabled={isSaving || isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Indonesia"
              disabled={isSaving || isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              disabled={isSaving || isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio / About You</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell about yourself..."
              rows={6}
              disabled={isSaving || isLoading}
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>
          )}

          <Button type="submit" disabled={isSaving || isLoading} className="w-full">
            {isSaving ? "Saving..." : "Save Personal Information"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
