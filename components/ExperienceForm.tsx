"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExperienceFormProps {
  onSubmit: (data: { company: string; period: string; description: string }) => Promise<void>
  initialData?: { company: string; period: string; description: string }
  isLoading?: boolean
  submitButtonText?: string
}

export function ExperienceForm({
  onSubmit,
  initialData,
  isLoading = false,
  submitButtonText = "Add Experience",
}: ExperienceFormProps) {
  const [company, setCompany] = useState(initialData?.company || "")
  const [period, setPeriod] = useState(initialData?.period || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!company.trim() || !period.trim() || !description.trim()) {
      setError("All fields are required")
      return
    }

    try {
      await onSubmit({ company, period, description })
      if (!initialData) {
        setCompany("")
        setPeriod("")
        setDescription("")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{initialData ? "Edit Experience" : "Add New Experience"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., TechNova"
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g., 2023 - present"
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your role and responsibilities..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Loading..." : submitButtonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
