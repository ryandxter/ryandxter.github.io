/**
 * Image caching and optimization strategies
 */

interface ImageCacheEntry {
  url: string
  cachedAt: number
  expiresAt: number
}

const IMAGE_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * In-memory cache for gallery images (on the client)
 * Persists across navigation
 */
class GalleryImageCache {
  private cache: Map<string, ImageCacheEntry> = new Map()

  /**
   * Get cached image entry
   */
  get(url: string): string | null {
    const entry = this.cache.get(url)
    if (!entry) return null

    // Check if cache is still valid
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(url)
      return null
    }

    return entry.url
  }

  /**
   * Set cache entry
   */
  set(url: string, cachedUrl: string): void {
    this.cache.set(url, {
      url: cachedUrl,
      cachedAt: Date.now(),
      expiresAt: Date.now() + IMAGE_CACHE_DURATION,
    })
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }
}

/**
 * Responsive image sizes for different breakpoints
 */
export const RESPONSIVE_SIZES = {
  gallery: "(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw",
  project: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 600px",
  thumbnail: "(max-width: 640px) 150px, (max-width: 1024px) 200px, 300px",
  fullWidth: "(max-width: 640px) 100vw, 100vw",
}

/**
 * Quality levels for different image types
 */
export const IMAGE_QUALITY = {
  thumbnail: 70,
  gallery: 75,
  project: 85,
  hero: 90,
}

// Export singleton instance
export const galleryImageCache = new GalleryImageCache()

/**
 * Preload images for better UX
 * Usage: preloadImages([url1, url2, ...])
 */
export function preloadImages(urls: string[]): void {
  if (typeof window === "undefined") return

  urls.forEach((url) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = url
    document.head.appendChild(link)
  })
}

/**
 * Get adaptive image quality based on device
 */
export function getAdaptiveQuality(): number {
  if (typeof window === "undefined") return IMAGE_QUALITY.gallery

  // Reduce quality on slower connections
  if ("connection" in navigator) {
    const connection = (navigator as any).connection
    if (connection?.saveData) return IMAGE_QUALITY.thumbnail
    if (connection?.effectiveType === "4g") return IMAGE_QUALITY.project
    if (connection?.effectiveType === "3g") return IMAGE_QUALITY.gallery
  }

  return IMAGE_QUALITY.gallery
}
