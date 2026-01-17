"use client"

import { useEffect } from "react"
import ResetPasswordForm from "@/components/ResetPasswordForm"
import { useSearchParams } from "next/navigation"

export default function AdminResetPage() {
  const params = useSearchParams()
  const token = params?.get("token") || ""

  useEffect(() => {
    // nothing extra for now
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <ResetPasswordForm token={token} />
    </div>
  )
}
