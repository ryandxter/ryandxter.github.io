"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit2 } from "lucide-react"

interface SocialLink {
  id: string
  label: string
  href: string
}

interface SocialLinksFormProps {
  links: SocialLink[]
  onRefresh: () => Promise<void>
}

export function SocialLinksForm({ links, onRefresh }: SocialLinksFormProps) {
  const [label, setLabel] = useState("")
  const [href, setHref] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!label.trim() || !href.trim()) {
      setError("All fields are required")
      return
    }

    setIsLoading(true)
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/social-links/${editingId}` : "/api/social-links"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, href }),
      })

      if (!response.ok) throw new Error("Failed to save social link")

      setLabel("")
      setHref("")
      setEditingId(null)
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (link: SocialLink) => {
    setLabel(link.label)
    setHref(link.href)
    setEditingId(link.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this social link?")) return

    try {
      const response = await fetch(`/api/social-links/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete")
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{editingId ? "Edit" : "Add"} Social Link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Twitter"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="href">URL</Label>
              <Input
                id="href"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                placeholder="https://example.com"
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : editingId ? "Update Link" : "Add Link"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Social Links</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-sm text-neutral-600">No social links yet.</p>
          ) : (
            <div className="grid gap-4">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900">{link.label}</p>
                    <p className="text-sm text-neutral-600 break-all">{link.href}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(link)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(link.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
