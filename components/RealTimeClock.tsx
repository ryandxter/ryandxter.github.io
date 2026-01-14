"use client"

import { useState, useEffect } from "react"

export function RealTimeClock() {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const date = new Date()
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }
      setTime(date.toLocaleTimeString("en-US", options))
    }

    updateTime() // Initial call to set the time immediately
    const timer = setInterval(updateTime, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center text-sm text-neutral-400">
      <span>{time} IST</span>
    </div>
  )
}
