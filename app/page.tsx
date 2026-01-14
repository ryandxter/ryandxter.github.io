"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { RealTimeClock } from "@/components/RealTimeClock"
import { Ticker } from "@/components/Ticker"
import { useState, useEffect, useRef } from "react"
import { useAdminEasterEgg } from "@/hooks/useAdminEasterEgg"
import { useRouter } from "next/navigation"
import { PasswordModal } from "@/components/PasswordModal"
import { useAdminSession } from "@/hooks/useAdminSession"
import { setAdminSession } from "@/lib/admin-session"

interface PortfolioInfo {
  id: string
  name: string
  career_name: string
  about: string
  email: string
  availability: string
}

interface Experience {
  id: string
  company: string
  period: string
  description: string
}

interface SocialLink {
  id: string
  label: string
  href: string
}

export default function Portfolio() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [portfolioInfo, setPortfolioInfo] = useState<PortfolioInfo | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(true)
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true)
  const [isLoadingSocial, setIsLoadingSocial] = useState(true)
  const router = useRouter()

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const { isAuthenticated, authenticate, logout } = useAdminSession()
  const headerRef = useRef<HTMLDivElement>(null)

  const { clickCount, targetClicks } = useAdminEasterEgg(headerRef, () => {
    setShowPasswordModal(true)
  })

  useEffect(() => {
    setIsLoaded(true)
    fetchPortfolioData()
    fetchExperiences()
    fetchSocialLinks()
  }, [])

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch("/api/portfolio")
      if (response.ok) {
        const data = await response.json()
        setPortfolioInfo(data)
      }
    } catch (error) {
      console.error("Failed to fetch portfolio info:", error)
    } finally {
      setIsLoadingPortfolio(false)
    }
  }

  const fetchExperiences = async () => {
    try {
      const response = await fetch("/api/experiences")
      if (response.ok) {
        const data = await response.json()
        setExperiences(data)
      }
    } catch (error) {
      console.error("Failed to fetch experiences:", error)
    } finally {
      setIsLoadingExperiences(false)
    }
  }

  const fetchSocialLinks = async () => {
    try {
      const response = await fetch("/api/social-links")
      if (response.ok) {
        const data = await response.json()
        setSocialLinks(data)
      }
    } catch (error) {
      console.error("Failed to fetch social links:", error)
    } finally {
      setIsLoadingSocial(false)
    }
  }

  const handlePasswordSubmit = (token: string) => {
    const expiresAt = Date.now() + 2 * 60 * 1000
    setAdminSession(token, expiresAt)
    authenticate(token)
    setShowPasswordModal(false)
    setPasswordError(null)
  }

  return (
    <main className="relative flex flex-col items-center bg-white min-h-screen font-sans">
      <div
        id="main-container"
        className="w-full min-h-screen bg-white z-10 px-4 sm:px-6 md:px-8 py-6 sm:py-8 mb-[1500px] transition-all duration-500 ease-in-out shadow-[0_0_20px_rgba(0,0,0,0.1)]"
      >
        <div className="mb-8 sm:mb-16 w-full max-w-[400px] mx-auto bg-white">
          <div className="flex flex-col gap-8 sm:gap-12 p-0 sm:p-4">
            <Header
              isLoaded={isLoaded}
              portfolioInfo={portfolioInfo}
              isLoadingPortfolio={isLoadingPortfolio}
              headerRef={headerRef}
            />
            <Description isLoaded={isLoaded} portfolioInfo={portfolioInfo} isLoadingPortfolio={isLoadingPortfolio} />
            <CTAButtons
              isLoaded={isLoaded}
              email={portfolioInfo?.email}
              availability={portfolioInfo?.availability}
              isLoadingPortfolio={isLoadingPortfolio}
            />
            <Experience isLoaded={isLoaded} experiences={experiences} isLoadingExperiences={isLoadingExperiences} />
            <SocialLinks isLoaded={isLoaded} links={socialLinks} isLoadingSocial={isLoadingSocial} />
            <ClockWrapper isLoaded={isLoaded} />
          </div>
        </div>
      </div>
      <Ticker />
      <PasswordModal isOpen={showPasswordModal} onAuthenticate={handlePasswordSubmit} onError={setPasswordError} />
    </main>
  )
}

function Header({
  isLoaded,
  portfolioInfo,
  isLoadingPortfolio,
  headerRef,
}: {
  isLoaded: boolean
  portfolioInfo: PortfolioInfo | null
  isLoadingPortfolio: boolean
  headerRef: React.RefObject<HTMLDivElement>
}) {
  return (
    <header
      ref={headerRef}
      className={`flex flex-col gap-1.5 transition-all duration-500 ease-out select-none cursor-pointer ${
        isLoaded ? "opacity-100 blur-none translate-y-0" : "opacity-0 blur-[4px] translate-y-2"
      }`}
      style={{ transitionDelay: "100ms", userSelect: "none" }}
    >
      {isLoadingPortfolio ? (
        <>
          <div className="h-6 bg-neutral-200 rounded w-32 animate-pulse" />
          <div className="h-4 bg-neutral-200 rounded w-40 animate-pulse" />
        </>
      ) : (
        <>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">{portfolioInfo?.name}</h1>
          <p className="text-sm font-medium text-[#62748e]">{portfolioInfo?.career_name}</p>
        </>
      )}
    </header>
  )
}

function Description({
  isLoaded,
  portfolioInfo,
  isLoadingPortfolio,
}: {
  isLoaded: boolean
  portfolioInfo: PortfolioInfo | null
  isLoadingPortfolio: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-4 sm:gap-6 transition-all duration-500 ease-out ${
        isLoaded ? "opacity-100 blur-none translate-y-0" : "opacity-0 blur-[4px] translate-y-2"
      }`}
      style={{ transitionDelay: "200ms" }}
    >
      <div className="flex flex-col gap-4 sm:gap-5">
        {isLoadingPortfolio ? (
          <>
            <div className="h-4 bg-neutral-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-4/6 animate-pulse" />
          </>
        ) : (
          <p className="text-sm text-neutral-900 whitespace-pre-wrap">{portfolioInfo?.about}</p>
        )}
      </div>
    </div>
  )
}

function CTAButtons({
  isLoaded,
  email,
  availability,
  isLoadingPortfolio,
}: {
  isLoaded: boolean
  email?: string
  availability?: string
  isLoadingPortfolio: boolean
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2.5 transition-all duration-500 ease-out ${
        isLoaded ? "opacity-100 blur-none translate-y-0" : "opacity-0 blur-[4px] translate-y-2"
      }`}
      style={{ transitionDelay: "300ms" }}
    >
      <Button
        variant="default"
        onClick={() => email && navigator.clipboard.writeText(email)}
        className="w-full sm:w-auto inline-flex h-[34px] items-center justify-center gap-2.5 pl-4 pr-3 py-0 bg-[#020618] rounded-[99px] hover:bg-[#020618]/90 text-slate-50 disabled:opacity-50"
        disabled={isLoadingPortfolio || !email}
      >
        <span className="font-medium text-[13px] leading-5 text-slate-50">
          {isLoadingPortfolio ? "Loading..." : "Copy email"}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" className="text-slate-50">
          <title>chevron-right</title>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
            <polyline points="4.25 10.25 8.5 6 4.25 1.75"></polyline>
          </g>
        </svg>
      </Button>
      <Button variant="ghost" className="w-full sm:w-auto gap-2 justify-center sm:justify-start">
        <span className="h-[13px] w-[13px] rounded-full bg-[#05df7233] flex items-center justify-center overflow-hidden">
          <span className="h-1.5 w-1.5 rounded-full bg-[#05df72] animate-scale-in" />
        </span>
        <span className="text-[13px] leading-5">{isLoadingPortfolio ? "Loading..." : availability || "Not set"}</span>
      </Button>
    </div>
  )
}

function Experience({
  isLoaded,
  experiences,
  isLoadingExperiences,
}: {
  isLoaded: boolean
  experiences: Experience[]
  isLoadingExperiences: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-6 transition-all duration-500 ease-out ${
        isLoaded ? "opacity-100 blur-none translate-y-0" : "opacity-0 blur-[4px] translate-y-2"
      }`}
      style={{ transitionDelay: "400ms" }}
    >
      <h2 className="text-sm text-neutral-400 uppercase">EXPERIENCE</h2>
      <div className="flex flex-col gap-6">
        {isLoadingExperiences ? (
          <p className="text-sm text-neutral-600">Loading experiences...</p>
        ) : experiences.length === 0 ? (
          <p className="text-sm text-neutral-600">No experiences yet.</p>
        ) : (
          experiences.map((exp) => (
            <div key={exp.id} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-neutral-900">{exp.company}</span>
                <span className="text-sm text-neutral-500">{exp.period}</span>
              </div>
              <p className="text-sm text-neutral-700">{exp.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function SocialLinks({
  isLoaded,
  links,
  isLoadingSocial,
}: {
  isLoaded: boolean
  links: SocialLink[]
  isLoadingSocial: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-6 transition-all duration-500 ease-out ${
        isLoaded ? "opacity-100 blur-none translate-y-0" : "opacity-0 blur-[4px] translate-y-2"
      }`}
      style={{ transitionDelay: "500ms" }}
    >
      <h2 className="text-sm text-neutral-400 uppercase">LET'S GET IN TOUCH</h2>
      <div className="flex flex-wrap gap-6">
        {isLoadingSocial ? (
          <p className="text-sm text-neutral-600">Loading links...</p>
        ) : links.length === 0 ? (
          <p className="text-sm text-neutral-600">No social links yet.</p>
        ) : (
          links.map((link) => (
            <div key={link.id} className="group">
              {link.label === "Email" ? (
                <button
                  onClick={() => navigator.clipboard.writeText(link.href.replace("mailto:", ""))}
                  className="text-sm text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 group"
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ) : (
                <a
                  href={link.href}
                  className="text-sm text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 group"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ClockWrapper({ isLoaded }: { isLoaded: boolean }) {
  return (
    <div
      className={`flex justify-start w-full transition-all duration-500 ease-out ${
        isLoaded ? "opacity-100 blur-none translate-y-0" : "opacity-0 blur-[4px] translate-y-2"
      }`}
      style={{ transitionDelay: "600ms" }}
    >
      <RealTimeClock />
    </div>
  )
}
