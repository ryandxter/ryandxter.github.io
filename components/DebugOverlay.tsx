"use client"

import React, { useEffect, useState } from "react"

export default function DebugOverlay() {
  const [dbg, setDbg] = useState<any>({})

  useEffect(() => {
    let raf = 0
    const loop = () => {
      try {
        // read debug info published to window by gallery components
        // (keeps rendering lightweight)
        // eslint-disable-next-line no-undef
        setDbg((window as any).__galleryDebug || {})
      } catch (e) {
        setDbg({})
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 99999,
        maxWidth: "420px",
        maxHeight: "60vh",
        overflow: "auto",
        background: "rgba(0,0,0,0.72)",
        color: "#e6edf3",
        fontSize: 12,
        lineHeight: 1.25,
        padding: 10,
        borderRadius: 8,
        boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
        fontFamily: "Menlo, monospace",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Gallery Debug</div>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(dbg, null, 2)}</pre>
    </div>
  )
}
