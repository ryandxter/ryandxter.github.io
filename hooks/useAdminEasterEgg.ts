"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"

const CLICK_TARGET = 10
const RESET_TIMEOUT = 2000

export function useAdminEasterEgg(elementRef: React.RefObject<HTMLElement>, onUnlock: () => void) {
  const [clickCount, setClickCount] = useState(0)
  const [resetTimer, setResetTimer] = useState<NodeJS.Timeout | null>(null)

  const handleElementClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const newCount = clickCount + 1

      if (resetTimer) clearTimeout(resetTimer)
      const timer = setTimeout(() => {
        setClickCount(0)
      }, RESET_TIMEOUT)
      setResetTimer(timer)

      setClickCount(newCount)

      if (newCount === CLICK_TARGET) {
        onUnlock()
        setClickCount(0)
      }
    },
    [clickCount, resetTimer, onUnlock],
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener("click", handleElementClick as any)
    return () => {
      element.removeEventListener("click", handleElementClick as any)
      if (resetTimer) clearTimeout(resetTimer)
    }
  }, [handleElementClick, resetTimer, elementRef])

  return { clickCount, targetClicks: CLICK_TARGET }
}
