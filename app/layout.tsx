import "@/app/globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import type { Metadata } from "next"
import { DisableContextMenu } from "@/components/DisableContextMenu"
import { cvData } from "@/data/cv-data"
import BackgroundPaths from "@/components/kokonutui/background-paths"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: `${cvData.personal.name} | Portfolio`,
  description: "Riansyah Rizky Curriculum Vitae - R&D Photography Videography System",
  authors: [{ name: "Riansyah Rizky" }],
  creator: "Riansyah Rizky",
  keywords: ["portfolio", "photography", "videography", "R&D", "Riansyah Rizky Poetra"],
  generator: "v0.app",
  openGraph: {
    title: `${cvData.personal.name} | Portfolio`,
    description: "Riansyah Rizky Curriculum Vitae - R&D Photography Videography System",
    type: "website",
    url: "https://v0-simple-portfolio-gm.vercel.app",
    images: [
      {
        url: "/favicon.png",
        width: 256,
        height: 256,
        alt: "Riansyah Rizky Logo",
      },
    ],
  },
  icons: {
    icon: [
      {
        url: "/favicon.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
    apple: "/favicon.png",
  },
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
          <div className="relative">
            <BackgroundPaths backgroundOnly />
            <div className="relative z-10">{children}</div>
          </div>
      </body>
    </html>
  )
}
