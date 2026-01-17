"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { OptimizedGalleryImage } from "@/components/OptimizedGalleryImage"
import React from "react"

// Removed debug global and setGalleryDebug function

interface SlideImage {
  id: string
  url: string
}

export function InfiniteSlideshow() {
  const [isVisible, setIsVisible] = useState(false)
  const [opacity, setOpacity] = useState(0)
  const [slideshowImages, setSlideshowImages] = useState<SlideImage[][]>([[], [], []])
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const containerRef = useRef<HTMLDivElement | null>(null)
  const prevScrollY = useRef<number>(typeof window !== "undefined" ? window.scrollY : 0)
  const scrollTimeout = useRef<number | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDir, setScrollDir] = useState<number>(1) // 1 = down, -1 = up

  useEffect(() => {
    // IntersectionObserver to toggle visibility when the slideshow is in viewport
    const el = containerRef.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
          if (entry.isIntersecting) {
            // fade in based on how much of it is visible
            const ratio = Math.min(entry.intersectionRatio * 2, 1)
            setOpacity(ratio)
          } else {
            setOpacity(0)
          }
        })
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    )

    io.observe(el)

    const onScroll = () => {
      const y = window.scrollY
      const dir = y > prevScrollY.current ? 1 : -1
      setScrollDir(dir)
      prevScrollY.current = y
      setIsScrolling(true)
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current)
      // stop animating shortly after user stops scrolling
      scrollTimeout.current = window.setTimeout(() => setIsScrolling(false), 200)
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current)
    }
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const files = event.target.files
    if (files) {
      ;(async () => {
        const uploaded: { id: string; url: string }[] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const form = new FormData()
          form.append("file", file)
          form.append("row_number", String(rowIndex))
          // position will be assigned server-side or left as 0

          try {
            const res = await fetch("/api/uploads/gallery", { method: "POST", body: form })
            if (!res.ok) continue
            const body = await res.json()
            if (body && body.url) {
              uploaded.push({ id: body.record?.id ?? Math.random().toString(36).substr(2, 9), url: body.url })
            }
          } catch (e) {
            // ignore per-file errors
          }
        }

        if (uploaded.length > 0) {
          setSlideshowImages((prev) => {
            const newState = [...prev]
            newState[rowIndex] = [...newState[rowIndex], ...uploaded]
            return newState
          })
        }
      })()
    }
  }

  const triggerFileInput = (index: number) => {
    fileInputRefs[index].current?.click()
  }

  const topRowRef = useRef<HTMLDivElement | null>(null)
  const bottomRowRef = useRef<HTMLDivElement | null>(null)
  const [globalEnabled, setGlobalEnabled] = useState(false)

  useEffect(() => {
    const topEl = topRowRef.current
    const bottomEl = bottomRowRef.current
    if (!topEl || !bottomEl) return

    let topVisible = false
    let bottomVisible = false

    const hysteresisMs = 150
    const disableTimeout = { current: null as number | null }

    const updateGlobalEnabled = () => {
      try {
        const topRect = topEl.getBoundingClientRect()
        const bottomRect = bottomEl.getBoundingClientRect()
        const computed = bottomRect.top < window.innerHeight && topRect.bottom < 0

        if (computed) {
          if (disableTimeout.current != null) {
            window.clearTimeout(disableTimeout.current)
            disableTimeout.current = null
          }
          setGlobalEnabled(true)
        } else {
          if (disableTimeout.current == null) {
            disableTimeout.current = window.setTimeout(() => {
              setGlobalEnabled(false)
              disableTimeout.current = null
            }, hysteresisMs)
          }
        }

        // debug removed
      } catch (e) {
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

    window.addEventListener("scroll", updateGlobalEnabled, { passive: true })
    window.addEventListener("resize", updateGlobalEnabled)
    updateGlobalEnabled()

    return () => {
      topIo.disconnect()
      bottomIo.disconnect()
      window.removeEventListener("scroll", updateGlobalEnabled)
      window.removeEventListener("resize", updateGlobalEnabled)
    }
  }, [slideshowImages])

  // block page vertical scrolling while slideshow is in control
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

  function RowTrack({ rowIndex, children, rootRef }: { rowIndex: number; children: React.ReactNode; rootRef?: React.RefObject<HTMLDivElement> }) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)
    const rafRef = useRef<number | null>(null)
    const velocityRef = useRef(0)
    const posRef = useRef(0)
    const visibleRef = useRef(false)

    useEffect(() => {
      const el = rootRef?.current ?? containerRef.current
      if (!el) return

      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
              visibleRef.current = entry.isIntersecting
            try {
              // no-op
            } catch (e) {}
          if (!visibleRef.current) {
            // reset offsets when not visible
            posRef.current = 0
            if (contentRef.current) contentRef.current.style.transform = `translateX(0px)`
          }
        })
      }, { threshold: 0.1 })

      io.observe(el)

      let prevY = typeof window !== "undefined" ? window.scrollY : 0

      const onScroll = () => {
        if (!visibleRef.current) return
        const y = window.scrollY
        const delta = y - prevY
        prevY = y
        const dir = rowIndex % 2 === 0 ? 1 : -1
        velocityRef.current += delta * 0.25 * dir
        startLoop()
      }

      const onWheel = (e: WheelEvent) => {
        if (!visibleRef.current) return
        const dir = rowIndex % 2 === 0 ? 1 : -1
        velocityRef.current += e.deltaY * 0.5 * dir
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
          const dir = rowIndex % 2 === 0 ? 1 : -1
          velocityRef.current += delta * 0.5 * dir
          startLoop()
        }
      }

      const startLoop = () => {
        if (rafRef.current != null) return
        // Removed debug log
        const step = () => {
          posRef.current += velocityRef.current
          velocityRef.current *= 0.82
          if (contentRef.current) contentRef.current.style.transform = `translateX(${posRef.current}px)`
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
    }, [rowIndex, rootRef, globalEnabled])

    return (
      <div ref={containerRef} className="slideshow-row relative overflow-visible h-[28vh]">
        <div ref={contentRef} className="slideshow-content absolute inset-0 flex gap-9" style={{ width: "200%", transform: "translateX(0px)" }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`slideshow-root fixed left-0 right-0 bottom-0 h-screen z-0 transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ opacity }}
    >
      <Card
        className="w-full h-full bg-[#fafafa] p-6 overflow-visible"
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
        onDoubleClick={(e) => e.preventDefault()}
        style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}
      >
        <div className="w-full max-w-7xl mx-auto h-full flex flex-col justify-between gap-9">
          {[0, 1, 2].map((rowIndex) => (
            <RowTrack key={rowIndex} rowIndex={rowIndex} rootRef={rowIndex === 0 ? topRowRef : rowIndex === 2 ? bottomRowRef : undefined}>
              <div className="absolute inset-0 flex gap-9" style={{ width: "200%" }}>
                <div className="flex gap-9">
                  {slideshowImages[rowIndex].length > 0
                    ? [...slideshowImages[rowIndex], ...slideshowImages[rowIndex]].map((image, index) => (
                        <div
                          key={`${image.id}-${index}`}
                          className="slideshow-tile flex-shrink-0 w-[300px] h-[28vh] rounded-lg overflow-hidden"
                        >
                          <OptimizedGalleryImage
                            src={image.url || "/placeholder.svg"}
                            alt={`Slideshow image ${index + 1}`}
                            width={300}
                            height={224}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 640px) 300px, (max-width: 1024px) 300px, 300px"
                            quality={80}
                          />
                        </div>
                      ))
                        : Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-[300px] h-[28vh] rounded-lg bg-[#fee5e5]"
                        />
                      ))}
                </div>
                <div className="flex gap-9">
                  {slideshowImages[rowIndex].length > 0
                    ? [...slideshowImages[rowIndex], ...slideshowImages[rowIndex]].map((image, index) => (
                        <div
                          key={`${image.id}-${index}-duplicate`}
                          className="flex-shrink-0 w-[300px] h-[28vh] rounded-lg overflow-hidden"
                        >
                          <OptimizedGalleryImage
                            src={image.url || "/placeholder.svg"}
                            alt={`Slideshow image ${index + 1}`}
                            width={300}
                            height={224}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 640px) 300px, (max-width: 1024px) 300px, 300px"
                            quality={80}
                          />
                        </div>
                      ))
                    : Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={`${index}-duplicate`}
                          className="flex-shrink-0 w-[300px] h-[28vh] rounded-lg bg-[#fee5e5]"
                        />
                      ))}
                </div>
              </div>
            </RowTrack>
          ))}
        </div>

        {[0, 1, 2].map((index) => (
          <React.Fragment key={index}>
            <input
              type="file"
              ref={fileInputRefs[index]}
              onChange={(e) => handleImageUpload(e, index)}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              onClick={() => triggerFileInput(index)}
              className={`absolute bottom-6 ${
                index === 0 ? "right-6" : index === 1 ? "right-[120px]" : "right-[234px]"
              } bg-[#ffffff] hover:bg-[#ffffff]/90 text-[#000000]`}
            >
              <Plus className="mr-2 h-4 w-4" /> Add to Row {index + 1}
            </Button>
          </React.Fragment>
        ))}
      </Card>
    </div>
  )
}
