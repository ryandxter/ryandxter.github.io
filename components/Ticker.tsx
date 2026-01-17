"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { OptimizedGalleryImage } from "./OptimizedGalleryImage"
import React from "react"

interface TickerImage {
  id: string
  url: string
  aspect?: number
}

interface TickerTrackProps {
  children: React.ReactNode
  direction?: "toLeft" | "toRight"
  speed?: number
  globalEnabled?: boolean
}

const TickerTrack: React.FC<TickerTrackProps> = ({ children, direction = "toRight", globalEnabled = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const velocityRef = useRef(0)
  const posRef = useRef(0)
  const visibleRef = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visibleRef.current = entry.isIntersecting
      })
    }, { threshold: 0.1 })

    io.observe(el)

    let prevY = typeof window !== "undefined" ? window.scrollY : 0

    const onScroll = () => {
      if (!visibleRef.current) return
      const y = window.scrollY
      const delta = y - prevY
      prevY = y
      const dir = direction === "toLeft" ? -1 : 1
      velocityRef.current += delta * 0.3 * dir
      
      startLoop()
    }

    const onWheel = (e: WheelEvent) => {
      if (!visibleRef.current) return
      const dir = direction === "toLeft" ? -1 : 1
      velocityRef.current += e.deltaY * 0.6 * dir
      startLoop()
    }

    let touchStartY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches?.[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!visibleRef.current) return
      const y = e.touches?.[0]?.clientY ?? null
      if (y != null && touchStartY != null) {
        const delta = touchStartY - y
        touchStartY = y
        const dir = direction === "toLeft" ? -1 : 1
        velocityRef.current += delta * 0.6 * dir
        startLoop()
      }
    }

    const startLoop = () => {
      if (rafRef.current != null) return
      const step = () => {
        posRef.current += velocityRef.current
        velocityRef.current *= 0.85
        if (contentRef.current) {
          contentRef.current.style.transform = `translateX(${posRef.current}px)`
        }
        if (Math.abs(velocityRef.current) < 0.1) {
          if (Math.abs(posRef.current) > 0.5) {
            posRef.current *= 0.9
            if (contentRef.current) contentRef.current.style.transform = `translateX(${posRef.current}px)`
            rafRef.current = requestAnimationFrame(step)
          } else {
            posRef.current = 0
            if (contentRef.current) contentRef.current.style.transform = `translateX(0px)`
            rafRef.current = null
          }
        } else {
          rafRef.current = requestAnimationFrame(step)
        }
      }
      rafRef.current = requestAnimationFrame(step)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })

    return () => {
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [direction, globalEnabled])

  return (
    <div ref={containerRef} className="relative overflow-hidden w-full h-full">
      <div ref={contentRef} className="ticker-content flex gap-4 md:gap-6 lg:gap-9" style={{ width: "max-content", transform: "translateX(0px)" }}>
        {children}
        {React.Children.map(children, (child) => React.cloneElement(child as React.ReactElement))}
      </div>
    </div>
  )
}

export function Ticker() {
  const [isVisible, setIsVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const [tickerImages, setTickerImages] = useState<{ [key: string]: TickerImage[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReaderMode, setIsReaderMode] = useState(false)

  const rows = useMemo(() => Object.entries(tickerImages).sort(([rowA], [rowB]) => {
    const numA = Number.parseInt(rowA.replace("row", ""))
    const numB = Number.parseInt(rowB.replace("row", ""))
    return numA - numB
  }), [tickerImages])

  const topRowRef = useRef<HTMLDivElement | null>(null)
  const bottomRowRef = useRef<HTMLDivElement | null>(null)
  const [globalEnabled, setGlobalEnabled] = useState(false)

  useEffect(() => {
    const topEl = topRowRef.current
    const bottomEl = bottomRowRef.current
    if (!topEl || !bottomEl) return
    let topVisible = false
    let bottomVisible = false

    // hysteresis: delay disabling so brief re-intersections don't flip the gate
    const hysteresisMs = 150
    const disableTimeout = { current: null as number | null }

    // compute globalEnabled using bounding rects — more deterministic than relying on two observers
    const updateGlobalEnabled = () => {
      try {
        const topRect = topEl.getBoundingClientRect()
        const bottomRect = bottomEl.getBoundingClientRect()
        // enable when bottom row is (at least partially) visible AND top row is scrolled above viewport
        const computed = bottomRect.top < window.innerHeight && topRect.bottom < 0

        // when computed becomes true, enable immediately and cancel any pending disable
        if (computed) {
          if (disableTimeout.current != null) {
            window.clearTimeout(disableTimeout.current)
            disableTimeout.current = null
          }
          setGlobalEnabled(true)
        } else {
          // schedule disable after hysteresisMs unless re-enabled
          if (disableTimeout.current == null) {
            disableTimeout.current = window.setTimeout(() => {
              setGlobalEnabled(false)
              disableTimeout.current = null
            }, hysteresisMs)
          }
        }

        // no debug logging
      } catch (err) {
        // ignore
      }
    }

    const topIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        topVisible = e.isIntersecting
        updateGlobalEnabled()
      })
    }, { threshold: 0.1 })

    const bottomIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        bottomVisible = e.isIntersecting
        updateGlobalEnabled()
      })
    }, { threshold: 0.1 })

    topIo.observe(topEl)
    bottomIo.observe(bottomEl)

    // recompute on scroll/resize to avoid missed states
    window.addEventListener("scroll", updateGlobalEnabled, { passive: true })
    window.addEventListener("resize", updateGlobalEnabled)
    // initial compute
    updateGlobalEnabled()

    return () => {
      topIo.disconnect()
      bottomIo.disconnect()
      window.removeEventListener("scroll", updateGlobalEnabled)
      window.removeEventListener("resize", updateGlobalEnabled)
      if (disableTimeout.current != null) window.clearTimeout(disableTimeout.current)
    }
  }, [rows])

  // block page vertical scrolling while gallery is in control
  useEffect(() => {
    const wheelBlock = (e: WheelEvent) => {
      if (globalEnabled) {
        e.preventDefault()
      }
    }

    const touchMoveBlock = (e: TouchEvent) => {
      if (globalEnabled) {
        e.preventDefault()
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("wheel", wheelBlock as EventListener, { passive: false, capture: true })
      window.addEventListener("touchmove", touchMoveBlock as EventListener, { passive: false, capture: true })
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("wheel", wheelBlock as EventListener, { capture: true })
        window.removeEventListener("touchmove", touchMoveBlock as EventListener, { capture: true })
      }
    }
  }, [globalEnabled])

  useEffect(() => {
    try {
      // no debug logging
    } catch (e) {}
  }, [globalEnabled])

  useEffect(() => {
    const handleScroll = () => {
      const mainContainer = document.getElementById("main-container")
      if (mainContainer) {
        const mainContainerRect = mainContainer.getBoundingClientRect()
        const scrollProgress = 1 - mainContainerRect.bottom / window.innerHeight

        if (scrollProgress > 0) {
          setIsVisible(true)
          setOpacity(Math.min(scrollProgress * 2, 1))
        } else {
          setIsVisible(false)
          setOpacity(0)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch("/api/gallery")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const galleryImages = await response.json()

        if (!Array.isArray(galleryImages)) {
          throw new Error("Invalid gallery format")
        }

        // Preload images to get aspect ratios, group by row
        const processedImages: { [key: string]: TickerImage[] } = {}

        const loadAspect = (url: string) =>
          new Promise<number>((resolve) => {
            const img = new window.Image()
            img.onload = () => {
              const aspect = img.naturalWidth / Math.max(img.naturalHeight, 1)
              resolve(aspect || 16 / 9)
            }
            img.onerror = () => resolve(16 / 9)
            img.src = url
          })

        // gather promises for all images
        const promises: Promise<void>[] = []

        galleryImages.forEach((img) => {
          const rowKey = `row${img.row_number}`
          if (!processedImages[rowKey]) processedImages[rowKey] = []

          const p = loadAspect(img.image_url).then((aspect) => {
            processedImages[rowKey].push({
              id: img.id,
              url: img.image_url,
              aspect,
            })
          })

          promises.push(p)
        })

        await Promise.all(promises)

        Object.keys(processedImages).forEach((row) => {
          processedImages[row].sort((a, b) => {
            const aIndex = galleryImages.findIndex((img) => img.id === a.id)
            const bIndex = galleryImages.findIndex((img) => img.id === b.id)
            return galleryImages[aIndex].position - galleryImages[bIndex].position
          })
        })

        setTickerImages(processedImages)
      } catch (error) {
        console.error("Error loading ticker images:", error)
        setError("Failed to load images. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
    }, [])

    // detect reader-mode class on documentElement and update state
    useEffect(() => {
      if (typeof document === "undefined") return
      const check = () => setIsReaderMode(document.documentElement.classList.contains("reader-mode"))
      check()
      const mo = new MutationObserver(() => check())
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
      return () => mo.disconnect()
    }, [])

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>
  }

  if (Object.keys(tickerImages).length === 0) {
    return <div className="text-center text-neutral-500 py-4">No gallery images yet</div>
  }

  return (
    <div
      className={`ticker-root fixed left-0 right-0 bottom-0 h-screen z-0 transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ opacity }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
      onDoubleClick={(e) => e.preventDefault()}
      // disable selection on the gallery
      data-no-select
    >
      <Card
        className="w-full h-full bg-[#fafafa] p-2 sm:p-4 lg:p-6 overflow-hidden relative"
        style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}
      >
        {/* plain background for gallery - background flow module removed */}
        <div className="w-full h-full flex flex-col justify-between gap-4 md:gap-6 lg:gap-9 relative z-10">
          {isReaderMode ? (
            // flattened grid for reader-mode (2 columns)
            (() => {
              const flat: TickerImage[] = []
              rows.forEach(([, imgs]) => flat.push(...imgs))
              // if odd, add a placeholder to make even
              const needsPlaceholder = flat.length % 2 !== 0
              if (needsPlaceholder) flat.push({ id: "placeholder", url: "" })
              return (
                <div className="ticker-content grid grid-cols-2 gap-2 p-2" style={{ width: "auto" }}>
                  {flat.map((image) => (
                    image.url ? (
                      <div key={image.id} className="ticker-tile rounded-lg overflow-hidden bg-neutral-100">
                        <OptimizedGalleryImage src={image.url} alt={`Ticker image`} width={300} height={300} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div key={image.id} className="ticker-tile rounded-lg overflow-hidden bg-transparent" />
                    )
                  ))}
                </div>
              )
            })()
          ) : (
            rows.map(([row, images], rowIndex) => (
              <div
                key={row}
                className="relative h-[28vh]"
                ref={(el) => {
                  if (rowIndex === 0) topRowRef.current = el
                  if (rowIndex === rows.length - 1) bottomRowRef.current = el
                }}
              >
                <TickerTrack direction={rowIndex % 2 === 0 ? "toRight" : "toLeft"} speed={20} globalEnabled={globalEnabled}>
                  {images.map((image) => {
                    const aspect = image.aspect || 16 / 9
                    // compute tile height in px based on 28vh
                    const tileHeightPx = Math.round(window.innerHeight * 0.28)
                    // base width is aspect * height; add slight randomness for variety
                    const jitter = 0.88 + Math.random() * 0.24 // 0.88 - 1.12
                    const rawWidth = Math.round(aspect * tileHeightPx * jitter)
                    const tileWidth = Math.max(160, Math.min(420, rawWidth))

                    return (
                      <div
                        key={image.id}
                        className="ticker-tile flex-shrink-0 h-[28vh] rounded-lg overflow-hidden bg-neutral-100"
                        style={{ width: `${tileWidth}px` }}
                      >
                        <OptimizedGalleryImage
                          src={image.url || "/placeholder.svg"}
                          alt={`Ticker image`}
                          width={tileWidth}
                          height={tileHeightPx}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )
                  })}
                </TickerTrack>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
