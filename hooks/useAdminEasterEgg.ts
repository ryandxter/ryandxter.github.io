"use client"

import { useEffect, useState, useCallback } from "react"

const CLICK_TARGET = 10
const RESET_TIMEOUT = 2000 // Reset after 2 seconds of inactivity

export function useAdminEasterEgg(onUnlock: () => void) {
  const [clickCount, setClickCount] = useState(0)
  const [resetTimer, setResetTimer] = useState<NodeJS.Timeout | null>(null)

  const handleBlankAreaClick = useCallback(
    (e: MouseEvent) => {
      // Only count clicks on completely empty areas (not on any interactive element)
      const target = e.target as HTMLElement
      if (target.tagName === "BODY" || (target.tagName === "DIV" && !target.className)) {
        const newCount = clickCount + 1

        // Reset timer
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
      }
    },
    [clickCount, resetTimer, onUnlock],
  )

  useEffect(() => {
    window.addEventListener("click", handleBlankAreaClick)
    return () => {
      window.removeEventListener("click", handleBlankAreaClick)
      if (resetTimer) clearTimeout(resetTimer)
    }
  }, [handleBlankAreaClick, resetTimer])

  return { clickCount, targetClicks: CLICK_TARGET }
}
