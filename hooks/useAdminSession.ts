"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getAdminSession, clearAdminSession } from "@/lib/admin-session"

const INACTIVITY_TIMEOUT = 2 * 60 * 1000 // 2 minutes

export function useAdminSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  const handleLogout = useCallback(() => {
    clearAdminSession()
    setIsAuthenticated(false)
    setSessionToken(null)
    setShowWarning(false)
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
  }, [])

  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    setShowWarning(false)

    // Set warning timer (warn 30 seconds before logout)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
    }, INACTIVITY_TIMEOUT - 30000)

    // Set logout timer
    inactivityTimerRef.current = setTimeout(() => {
      handleLogout()
    }, INACTIVITY_TIMEOUT)
  }, [handleLogout])

  useEffect(() => {
    // Check if already authenticated on mount
    const token = getAdminSession()
    if (token) {
      setSessionToken(token)
      setIsAuthenticated(true)
      resetInactivityTimer()
    }
  }, [resetInactivityTimer])

  useEffect(() => {
    if (!isAuthenticated) return

    // Add activity listeners
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"]

    const handleActivity = () => {
      resetInactivityTimer()
    }

    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    }
  }, [isAuthenticated, resetInactivityTimer])

  const authenticate = (token: string) => {
    setSessionToken(token)
    setIsAuthenticated(true)
    resetInactivityTimer()
  }

  return { isAuthenticated, sessionToken, authenticate, logout: handleLogout, showWarning }
}
