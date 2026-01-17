"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit2 } from "lucide-react"
import Image from "next/image"

interface GalleryImage {
  id: string
  row_number: number
  image_url: string
  position: number
}

interface GalleryImagesFormProps {
  images: GalleryImage[]
  onRefresh: () => Promise<void>
}

export function GalleryImagesForm({ images, onRefresh }: GalleryImagesFormProps) {
  const [rowNumber, setRowNumber] = useState("1")
  const [imageUrl, setImageUrl] = useState("")
  const [position, setPosition] = useState("0")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!rowNumber || !imageUrl.trim() || position === "") {
      setError("All fields are required")
      return
    }

    setIsLoading(true)
    try {
      // Block session-scoped object URLs from being saved
      if (imageUrl.trim().startsWith("blob:") || imageUrl.trim().startsWith("data:")) {
        setError("Blob/object or data URLs are not allowed. Use the original remote URL so the server can import and cache it.")
        setIsLoading(false)
        return
      }
      if (editingId) {
        // update existing record via import CRUD endpoint
        const importRes = await fetch(`/api/uploads/gallery/import`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: [{ action: "update", id: editingId, url: imageUrl, row_number: Number.parseInt(rowNumber), position: Number.parseInt(position) }] }),
        })

        if (!importRes.ok) {
          const body = await importRes.json().catch(() => ({}))
          throw new Error(body?.error || "Failed to update image via import endpoint")
        }
      } else {
        // For new images: attempt server-side import (fetch + upload) to canonicalize and cache
        // create via import CRUD endpoint
        const importRes = await fetch("/api/uploads/gallery/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: [{ action: "create", url: imageUrl, row_number: Number.parseInt(rowNumber), position: Number.parseInt(position) }] }),
        })

        if (!importRes.ok) {
          const body = await importRes.json().catch(() => ({}))
          throw new Error(body?.error || "Failed to create image via import endpoint")
        }

        const importBody = await importRes.json().catch(() => ({}))
        const first = Array.isArray(importBody?.results) ? importBody.results[0] : null
        if (first && first.ok && first.record) {
          // inserted record present
          setRowNumber("1")
          setImageUrl("")
          setPosition("0")
          await onRefresh()
          return
        }
      }

      setRowNumber("1")
      setImageUrl("")
      setPosition("0")
      setEditingId(null)
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (image: GalleryImage) => {
    setRowNumber(image.row_number.toString())
    setImageUrl(image.image_url)
    setPosition(image.position.toString())
    setEditingId(image.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return

    try {
      const importRes = await fetch(`/api/uploads/gallery/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ action: "delete", id }] }),
      })

      if (!importRes.ok) {
        const body = await importRes.json().catch(() => ({}))
        throw new Error(body?.error || "Failed to delete via import endpoint")
      }

      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const groupedImages = images.reduce(
    (acc, img) => {
      if (!acc[img.row_number]) {
        acc[img.row_number] = []
      }
      acc[img.row_number].push(img)
      return acc
    },
    {} as Record<number, GalleryImage[]>,
  )

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{editingId ? "Edit" : "Add"} Gallery Image</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rowNumber">Row Number</Label>
                <Input
                  id="rowNumber"
                  type="number"
                  min="1"
                  value={rowNumber}
                  onChange={(e) => setRowNumber(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  min="0"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : editingId ? "Update Image" : "Add Image"}
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
          <CardTitle className="text-lg">Gallery Images by Row</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedImages).length === 0 ? (
            <p className="text-sm text-neutral-600">No gallery images yet.</p>
          ) : (
            <div className="grid gap-6">
              {Object.entries(groupedImages)
                .sort(([rowA], [rowB]) => Number.parseInt(rowA) - Number.parseInt(rowB))
                .map(([row, rowImages]) => (
                  <div key={row}>
                    <h3 className="font-medium text-neutral-900 mb-4">Row {row}</h3>
                    <div className="grid gap-4">
                      {rowImages
                        .sort((a, b) => a.position - b.position)
                        .map((img) => (
                          <div key={img.id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="flex-shrink-0 w-24 h-24 bg-neutral-100 rounded overflow-hidden">
                              {typeof img.image_url === "string" && (img.image_url.startsWith("blob:") || img.image_url.startsWith("data:")) ? (
                                <img src="/placeholder.svg" alt="Gallery placeholder" className="w-full h-full object-cover" />
                              ) : (
                                <Image
                                  src={img.image_url || "/placeholder.svg"}
                                  alt="Gallery"
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg"
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-neutral-600">Position: {img.position}</p>
                              <p className="text-xs text-neutral-500 break-all mt-2">{img.image_url}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(img)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(img.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
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
