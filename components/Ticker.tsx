"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import React from "react"

interface TickerImage {
  id: string
  url: string
}

interface TickerTrackProps {
  children: React.ReactNode
  direction?: "toLeft" | "toRight"
  speed?: number
}

const TickerTrack: React.FC<TickerTrackProps> = ({ children, direction = "toRight", speed = 30 }) => {
  const [movePosition, setMovePosition] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const multiplier = direction === "toLeft" ? -1 : 1

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        const movement = ((deltaTime * speed) / 1000) * multiplier

        setMovePosition((prevPos) => {
          const contentWidth = contentRef.current?.offsetWidth || 0
          const adjustedContentWidth = contentWidth / 2
          if (direction === "toLeft" && prevPos <= -adjustedContentWidth) {
            return 0
          }
          if (direction === "toRight" && prevPos >= 0) {
            return -adjustedContentWidth
          }
          return prevPos + movement
        })
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    },
    [speed, direction, multiplier],
  )

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [animate])

  return (
    <div ref={containerRef} className="relative overflow-hidden w-full h-full">
      <div
        ref={contentRef}
        className="absolute flex gap-4 md:gap-6 lg:gap-9"
        style={{
          transform: `translateX(${movePosition}px)`,
          width: "max-content",
        }}
      >
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

        const processedImages: { [key: string]: TickerImage[] } = {}
        galleryImages.forEach((img) => {
          const rowKey = `row${img.row_number}`
          if (!processedImages[rowKey]) {
            processedImages[rowKey] = []
          }
          processedImages[rowKey].push({
            id: img.id,
            url: img.image_url,
          })
        })

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
      className={`fixed left-0 right-0 bottom-0 h-screen z-0 transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ opacity }}
    >
      <Card className="w-full h-full bg-[#fafafa] p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="w-full h-full flex flex-col justify-between gap-4 md:gap-6 lg:gap-9">
          {Object.entries(tickerImages)
            .sort(([rowA], [rowB]) => {
              const numA = Number.parseInt(rowA.replace("row", ""))
              const numB = Number.parseInt(rowB.replace("row", ""))
              return numA - numB
            })
            .map(([row, images], rowIndex) => (
              <div key={row} className="relative h-[28vh]">
                <TickerTrack direction={rowIndex % 2 === 0 ? "toRight" : "toLeft"} speed={20}>
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="flex-shrink-0 w-[230px] sm:w-[280px] md:w-[330px] h-[28vh] rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={`Ticker image`}
                        width={330}
                        height={224}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                  ))}
                </TickerTrack>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}
