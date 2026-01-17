"use client"

import { useEffect } from "react"

function isSupportedBrowser(ua: string) {
  const s = ua.toLowerCase()
  // Opera
  if (/opr|opera/.test(s)) return true
  // Edge
  if (/edg|edge/.test(s)) return true
  // Chrome (exclude other chromium-based markers like edge/opera)
  if (/chrome|crios/.test(s) && !/edg|opr|opera/.test(s)) return true
  // Safari (exclude chrome)
  if (/safari/.test(s) && !/chrome|crios|chromium/.test(s)) return true
  // Firefox
  if (/firefox|fxios/.test(s)) return true
  return false
}

export default function ReaderMode() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const mql = window.matchMedia("(max-width: 420px)")
    const ua = navigator.userAgent || ""
    const shouldEnable = () => mql.matches && isSupportedBrowser(ua)

    const apply = (on: boolean) => {
      const root = document.documentElement
      if (on) root.classList.add("reader-mode")
      else root.classList.remove("reader-mode")
    }

    apply(shouldEnable())

    const onChange = () => apply(shouldEnable())
    mql.addEventListener?.("change", onChange)
    return () => mql.removeEventListener?.("change", onChange)
  }, [])

  // no visible UI; this component purely applies the `.reader-mode` class
  return null
}
