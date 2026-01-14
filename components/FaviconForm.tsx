"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export function FaviconForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get("favicon") as File

    if (!file) {
      setMessage({ type: "error", text: "Please select a file" })
      return
    }

    // Validate file type
    if (!["image/x-icon", "image/vnd.microsoft.icon", "image/png"].includes(file.type)) {
      setMessage({ type: "error", text: "Please upload a .ico or .png file" })
      return
    }

    // Validate file size (max 100KB)
    if (file.size > 100 * 1024) {
      setMessage({ type: "error", text: "File size must be less than 100KB" })
      return
    }

    setIsLoading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/favicon", {
        method: "POST",
        body: uploadFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload favicon")
      }

      setMessage({ type: "success", text: "Favicon uploaded successfully! Refresh your browser to see the changes." })
      setPreview(null)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to upload favicon",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Favicon Management</CardTitle>
        <CardDescription>Upload a custom favicon for your portfolio. Recommended: 32x32 ICO or 180x180 PNG file</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8">
              <input
                type="file"
                name="favicon"
                id="favicon"
                accept=".ico,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="favicon" className="cursor-pointer block text-center">
                <div className="space-y-2">
                  {preview ? (
                    <div className="flex justify-center">
                      <img src={preview} alt="Favicon preview" className="w-16 h-16 rounded" />
                    </div>
                  ) : (
                    <div className="text-2xl">📁</div>
                  )}
                  <p className="text-sm font-medium text-neutral-700">Click to select or drag and drop</p>
                  <p className="text-xs text-neutral-500">ICO or PNG (max 100KB)</p>
                </div>
              </label>
            </div>

            {message && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload Favicon"}
          </Button>
        </form>

        <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
          <h3 className="font-semibold text-neutral-900 mb-2">Current Favicon</h3>
          <div className="flex items-center gap-4">
            <img src="/favicon.ico" alt="Current favicon" className="w-12 h-12 rounded border" />
            <p className="text-sm text-neutral-600">The current favicon displayed in browser tabs and bookmarks</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
