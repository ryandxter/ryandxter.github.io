/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["vercel.com", "assets.vercel.com", "hebbkx1anhila5yf.public.blob.vercel-storage.com"],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
