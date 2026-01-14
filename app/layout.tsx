import "@/app/globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import type { Metadata } from "next"
import { DisableContextMenu } from "@/components/DisableContextMenu"
import { cvData } from "@/data/cv-data"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: `${cvData.personal.name} - ${cvData.personal.title}`,
  description: cvData.personal.bio,
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
        {children}
      </body>
    </html>
  )
}
