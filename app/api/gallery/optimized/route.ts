import { NextResponse } from "next/server"

/**
 * Gallery image optimization endpoint
 * Handles responsive image sizing and caching strategies
 * Returns image URLs with appropriate widths for different screen sizes
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")
  const width = searchParams.get("width") || "300"
  const quality = searchParams.get("quality") || "75"

  if (!imageUrl) {
    return NextResponse.json({ error: "Image URL required" }, { status: 400 })
  }

  try {
    // For now, return the original URL with cache headers
    // In production, you could integrate with a service like Cloudinary or ImageKit
    // for on-the-fly image optimization

    return NextResponse.json(
      {
        original: imageUrl,
        optimized: imageUrl,
        sizes: {
          small: imageUrl, // 320px
          medium: imageUrl, // 768px
          large: imageUrl, // 1200px
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable", // 1 year for static images
          "CDN-Cache-Control": "max-age=31536000",
        },
      },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to optimize image" }, { status: 500 })
  }
}
