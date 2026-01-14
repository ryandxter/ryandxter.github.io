"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { PersonalInfoForm } from "@/components/PersonalInfoForm"
import { SocialLinksForm } from "@/components/SocialLinksForm"
import { GalleryImagesForm } from "@/components/GalleryImagesForm"
import { ExperienceForm } from "@/components/ExperienceForm"
import { FaviconForm } from "@/components/FaviconForm"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Edit2 } from "lucide-react"
import { PasswordModal } from "@/components/PasswordModal"
import { useAdminSession } from "@/hooks/useAdminSession"
import { setAdminSession } from "@/lib/admin-session"

interface Experience {
  id: string
  company: string
  period: string
  description: string
  created_at: string
}

interface SocialLink {
  id: string
  label: string
  href: string
}

interface GalleryImage {
  id: string
  row_number: number
  image_url: string
  position: number
}

export default function AdminDashboard() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null)
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(true)
  const [isLoadingSocial, setIsLoadingSocial] = useState(true)
  const [isLoadingGallery, setIsLoadingGallery] = useState(true)
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { isAuthenticated, authenticate, logout, showWarning } = useAdminSession()
  const [showPasswordModal, setShowPasswordModal] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const fetchExperiences = async () => {
    try {
      setIsLoadingExperiences(true)
      const response = await fetch("/api/experiences")
      if (response.ok) {
        const data = await response.json()
        setExperiences(data)
      }
    } catch (err) {
      setError("Failed to load experiences")
    } finally {
      setIsLoadingExperiences(false)
    }
  }

  const fetchSocialLinks = async () => {
    try {
      setIsLoadingSocial(true)
      const response = await fetch("/api/social-links")
      if (response.ok) {
        const data = await response.json()
        setSocialLinks(data)
      }
    } catch (err) {
      setError("Failed to load social links")
    } finally {
      setIsLoadingSocial(false)
    }
  }

  const fetchGalleryImages = async () => {
    try {
      setIsLoadingGallery(true)
      const response = await fetch("/api/gallery")
      if (response.ok) {
        const data = await response.json()
        setGalleryImages(data)
      }
    } catch (err) {
      setError("Failed to load gallery images")
    } finally {
      setIsLoadingGallery(false)
    }
  }

  const handlePasswordSubmit = (token: string) => {
    const expiresAt = Date.now() + 2 * 60 * 1000
    setAdminSession(token, expiresAt)
    authenticate(token)
    setShowPasswordModal(false)
    setAuthError(null)
  }

  const handleAddExperience = async (data: { company: string; period: string; description: string }) => {
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

  const handleUpdateExperience = async (id: string, data: { company: string; period: string; description: string }) => {
    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update experience")
      await fetchExperiences()
      setEditingExperienceId(null)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to update experience")
    }
  }

  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return
    try {
      const response = await fetch(`/api/experiences/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete experience")
      await fetchExperiences()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete experience")
    }
  }

  const handleSavePortfolioInfo = async (data: any) => {
    setIsSavingPortfolio(true)
    try {
      const response = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to save portfolio info")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save portfolio info")
    } finally {
      setIsSavingPortfolio(false)
    }
  }

  const handleSeedData = async () => {
    setIsSeeding(true)
    setError(null)
    try {
      const response = await fetch("/api/seed", { method: "POST" })
      if (!response.ok) throw new Error("Failed to sync data")
      
      // Refresh all data after seeding
      await Promise.all([
        fetchExperiences(),
        fetchSocialLinks(),
        fetchGalleryImages()
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync data")
    } finally {
      setIsSeeding(false)
    }
  }

  const editingExperience = experiences.find((exp) => exp.id === editingExperienceId)

  useEffect(() => {
    if (isAuthenticated) {
      fetchExperiences()
      fetchSocialLinks()
      fetchGalleryImages()
    }
  }, [isAuthenticated])

  return (
    <main className="min-h-screen bg-white p-4 sm:p-8">
      <PasswordModal isOpen={!isAuthenticated} onAuthenticate={handlePasswordSubmit} onError={setAuthError} />

      {isAuthenticated && (
        <>
          {showWarning && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 flex items-center justify-between">
              <span>Your session will expire in 30 seconds due to inactivity.</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout Now
              </Button>
            </div>
          )}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-neutral-900">Portfolio Admin Dashboard</h1>
              <div className="flex gap-2">
                <Link href="/">
                  <Button variant="outline">Back to Portfolio</Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleSeedData}
                  disabled={isSeeding}
                >
                  {isSeeding ? "Syncing..." : "Sync from CV Data"}
                </Button>
                <Button variant="destructive" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="portfolio">Portfolio Info</TabsTrigger>
                <TabsTrigger value="social">Social Links</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="favicon">Favicon</TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="mt-6">
                <PersonalInfoForm />
              </TabsContent>

              <TabsContent value="social" className="mt-6">
                {isLoadingSocial ? (
                  <p className="text-center py-4">Loading social links...</p>
                ) : (
                  <SocialLinksForm links={socialLinks} onRefresh={fetchSocialLinks} />
                )}
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                {isLoadingGallery ? (
                  <p className="text-center py-4">Loading gallery images...</p>
                ) : (
                  <GalleryImagesForm images={galleryImages} onRefresh={fetchGalleryImages} />
                )}
              </TabsContent>

              <TabsContent value="experience" className="mt-6">
                <div className="grid gap-8">
                  <ExperienceForm
                    onSubmit={(data) =>
                      editingExperienceId
                        ? handleUpdateExperience(editingExperienceId, data)
                        : handleAddExperience(data)
                    }
                    initialData={editingExperience}
                    submitButtonText={editingExperienceId ? "Update Experience" : "Add Experience"}
                  />

                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">Current Experiences</h2>
                    {isLoadingExperiences ? (
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
                                    onClick={() => setEditingExperienceId(exp.id)}
                                    disabled={editingExperienceId !== null}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteExperience(exp.id)}
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
              </TabsContent>

              <TabsContent value="favicon" className="mt-6">
                <FaviconForm />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </main>
  )
}
