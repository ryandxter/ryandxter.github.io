"use client"

import Image from "next/image"

interface OptimizedGalleryImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
}

/**
 * OptimizedGalleryImage component
 * - Uses Next.js Image for automatic optimization
 * - Implements responsive sizing with srcset
 * - Enables lazy loading by default
 * - Provides adaptive quality based on device/connection
 */
export function OptimizedGalleryImage({
  src,
  alt,
  width = 300,
  height = 224,
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw",
  quality = 75,
}: OptimizedGalleryImageProps) {
  // adjust quality based on devicePixelRatio and Save-Data network hint
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const connection = typeof navigator !== "undefined" ? (navigator as any).connection || {} : {}
  const saveData = connection.saveData === true
  let computedQuality = Math.max(40, Math.min(quality, Math.round(quality / dpr)))
  if (saveData) computedQuality = Math.min(computedQuality, 50)

  return (
    <Image
      src={typeof src === "string" && (src.startsWith("blob:") || src.startsWith("data:")) ? "/placeholder.svg" : src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={computedQuality}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      placeholder="empty"
      onError={(e) => {
        const img = e.target as HTMLImageElement
        img.src = "/placeholder.svg"
      }}
    />
  )
}
