import "@/app/globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import type { Metadata } from "next"
import { DisableContextMenu } from "@/components/DisableContextMenu"
import ReaderMode from "@/components/ReaderMode"
import { createClient } from "@/lib/supabase/server"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const DEFAULT_HOST = "ryandxter.vercel.app"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient()
    const { data: portfolio } = await supabase.from("portfolio_info").select("*").single()

    const name = portfolio?.name || "Riansyah Rizky"
    const title = portfolio?.title || portfolio?.career_name || "Portfolio"
    const ogTitle = portfolio?.og_title || `${name} | ${title}`
    const description = portfolio?.og_description || portfolio?.bio || "Riansyah Rizky Curriculum Vitae - R&D Photography Videography System"
    const image = portfolio?.og_image_url || `https://${DEFAULT_HOST}/favicon.png`

    return {
      title: `${name} | ${title}`,
      description,
      authors: [{ name }],
      creator: name,
      keywords: ["portfolio", "photography", "videography", "R&D", name],
      generator: "v0.app",
      metadataBase: new URL(`https://${DEFAULT_HOST}`),
      openGraph: {
        title: ogTitle,
        description,
        type: "website",
        url: `https://${DEFAULT_HOST}`,
        siteName: DEFAULT_HOST,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: `${name} social image`,
          },
        ],
      },
      twitter: {
        title: ogTitle,
        card: "summary_large_image",
        images: [image],
      },
      icons: {
        icon: [
          {
            url: `https://${DEFAULT_HOST}/favicon.png`,
            sizes: "256x256",
            type: "image/png",
          },
        ],
        apple: `https://${DEFAULT_HOST}/favicon.png`,
      },
    }
  } catch (err) {
    // fallback to reasonable defaults if supabase call fails
    return {
      title: `Riansyah Rizky | Portfolio`,
      description: "Riansyah Rizky Curriculum Vitae - R&D Photography Videography System",
      metadataBase: new URL(`https://${DEFAULT_HOST}`),
      openGraph: {
        title: `Riansyah Rizky | Portfolio`,
        description: "Riansyah Rizky Curriculum Vitae - R&D Photography Videography System",
        type: "website",
        url: `https://${DEFAULT_HOST}`,
        siteName: DEFAULT_HOST,
        images: [
          {
            url: `https://${DEFAULT_HOST}/favicon.png`,
            width: 256,
            height: 256,
            alt: "Riansyah Rizky Logo",
          },
        ],
      },
      icons: {
        icon: [
          {
            url: `https://${DEFAULT_HOST}/favicon.png`,
            sizes: "256x256",
            type: "image/png",
          },
        ],
        apple: `https://${DEFAULT_HOST}/favicon.png`,
      },
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <DisableContextMenu />
        <ReaderMode />
        {children}
      </body>
    </html>
  )
}
