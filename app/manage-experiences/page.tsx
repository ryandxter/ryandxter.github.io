"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExperienceForm } from "@/components/ExperienceForm"
import Link from "next/link"
import { Trash2, Edit2 } from "lucide-react"

interface Experience {
  id: string
  company: string
  period: string
  description: string
  created_at: string
}

export default function ManageExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/experiences")
      if (!response.ok) throw new Error("Failed to fetch experiences")
      const data = await response.json()
      setExperiences(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async (data: { company: string; period: string; description: string }) => {
    try {
      const response = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to add experience")
      await fetchExperiences()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to add experience")
    }
  }

  const handleUpdate = async (id: string, data: { company: string; period: string; description: string }) => {
    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update experience")
      await fetchExperiences()
      setEditingId(null)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to update experience")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return
    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete experience")
      await fetchExperiences()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete experience")
    }
  }

  const editingExperience = experiences.find((exp) => exp.id === editingId)

  return (
    <main className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Manage Experiences</h1>
          <Link href="/">
            <Button variant="outline">Back to Portfolio</Button>
          </Link>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

        <div className="grid gap-8">
          {/* Add/Edit Form */}
          <ExperienceForm
            onSubmit={(data) => (editingId ? handleUpdate(editingId, data) : handleAdd(data))}
            initialData={editingExperience}
            submitButtonText={editingId ? "Update Experience" : "Add Experience"}
          />

          {/* Experiences List */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Current Experiences</h2>
            {isLoading ? (
              <p className="text-neutral-600">Loading experiences...</p>
            ) : experiences.length === 0 ? (
              <p className="text-neutral-600">No experiences yet. Add one to get started!</p>
            ) : (
              <div className="grid gap-4">
                {experiences.map((exp) => (
                  <Card key={exp.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-neutral-900">{exp.company}</h3>
                            <span className="text-sm text-neutral-500">{exp.period}</span>
                          </div>
                          <p className="text-neutral-700 text-sm">{exp.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(exp.id)}
                            disabled={editingId !== null}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(exp.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
