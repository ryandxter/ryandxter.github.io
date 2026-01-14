const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "vercel.com" },
      { hostname: "assets.vercel.com" },
      { hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
