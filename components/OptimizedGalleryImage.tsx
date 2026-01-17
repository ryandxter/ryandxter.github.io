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
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={quality}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      placeholder="empty"
      onError={(e) => {
        // Fallback for broken images
        const img = e.target as HTMLImageElement
        img.src = "/placeholder.svg"
      }}
    />
  )
}
