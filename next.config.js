const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "vercel.com" },
      { hostname: "assets.vercel.com" },
      { hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
      { hostname: "ktopbjlnigyxodxqvogy.supabase.co" },
      { hostname: "i.imgur.com" },
    ],
    // enable Next.js image optimization so images are resized and compressed per device
    unoptimized: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
