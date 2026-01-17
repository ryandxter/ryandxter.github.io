"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PortfolioInfo {
  id: string
  name: string
  career_name: string
  about: string
  email: string
  availability: string
}

interface PortfolioInfoFormProps {
  onSubmit: (data: Omit<PortfolioInfo, "id"> & { og_title?: string; og_description?: string; og_image_url?: string }) => Promise<void>
  isLoading?: boolean
}

export function PortfolioInfoForm({ onSubmit, isLoading = false }: PortfolioInfoFormProps) {
  const [name, setName] = useState("")
  const [careerName, setCareerName] = useState("")
  const [about, setAbout] = useState("")
  const [email, setEmail] = useState("")
  const [availability, setAvailability] = useState("")
  const [ogTitle, setOgTitle] = useState("")
  const [ogDescription, setOgDescription] = useState("")
  const [ogImageUrl, setOgImageUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const fetchPortfolioInfo = async () => {
      try {
        const response = await fetch("/api/portfolio")
        if (response.ok) {
          const data = await response.json()
          setName(data.name)
          setCareerName(data.career_name)
          setAbout(data.about)
          setEmail(data.email)
          setAvailability(data.availability)
          setOgTitle(data.og_title || "")
          setOgDescription(data.og_description || "")
          setOgImageUrl(data.og_image_url || "")
        }
      } catch (err) {
        setError("Failed to load portfolio info")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchPortfolioInfo()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !careerName.trim() || !about.trim() || !email.trim() || !availability.trim()) {
      setError("All fields are required")
      return
    }

    try {
      await onSubmit({ name, career_name: careerName, about, email, availability, og_title: ogTitle, og_description: ogDescription, og_image_url: ogImageUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (isLoadingData) {
    return <div className="text-center py-4">Loading portfolio info...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Portfolio Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe"
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="careerName">Career/Job Title</Label>
            <Input
              id="careerName"
              value={careerName}
              onChange={(e) => setCareerName(e.target.value)}
              placeholder="e.g., Product Designer"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="availability">Availability</Label>
            <Input
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g., Available for February"
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="about">About You</Label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell about yourself..."
              rows={6}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ogTitle">OG Title</Label>
            <Input id="ogTitle" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder="Open Graph title" disabled={isLoading} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ogDescription">OG Description</Label>
            <Textarea id="ogDescription" value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} placeholder="Open Graph description" rows={3} disabled={isLoading} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ogImageUrl">OG Image URL</Label>
            <Input id="ogImageUrl" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" disabled={isLoading || isUploading} />
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setIsUploading(true)
                try {
                  const form = new FormData()
                  form.append('file', file)
                  const res = await fetch('/api/uploads/og-image', { method: 'POST', body: form })
                  const data = await res.json()
                  if (res.ok && data.url) setOgImageUrl(data.url)
                  else setError(data.error || 'Upload failed')
                } catch (err) {
                  setError('Upload failed')
                } finally {
                  setIsUploading(false)
                }
              }} />
              {isUploading && <span className="text-sm text-neutral-500">Uploading...</span>}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save Portfolio Info"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
