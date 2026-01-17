import React from "react"
import ResetPasswordForm from "@/components/ResetPasswordForm"

export default function AdminResetPage() {
  // Keep this page as a server component. The client ResetPasswordForm
  // will read the `token` from the URL via `useSearchParams` on the client.
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <React.Suspense fallback={<div className="p-6">Loading...</div>}>
        <ResetPasswordForm />
      </React.Suspense>
    </div>
  )
}
