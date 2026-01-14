import { useEffect, useState } from "react"

interface PersonalData {
  name: string
  title: string
  email: string
  location: string
  bio: string
}

export function usePersonalData() {
  const [data, setData] = useState<PersonalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/portfolio")
        if (!response.ok) {
          throw new Error("Failed to fetch personal data")
        }
        const personalData = await response.json()
        setData(personalData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, isLoading, error }
}
