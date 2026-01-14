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
  onSubmit: (data: Omit<PortfolioInfo, "id">) => Promise<void>
  isLoading?: boolean
}

export function PortfolioInfoForm({ onSubmit, isLoading = false }: PortfolioInfoFormProps) {
  const [name, setName] = useState("")
  const [careerName, setCareerName] = useState("")
  const [about, setAbout] = useState("")
  const [email, setEmail] = useState("")
  const [availability, setAvailability] = useState("")
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
      await onSubmit({ name, career_name: careerName, about, email, availability })
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

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save Portfolio Info"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
