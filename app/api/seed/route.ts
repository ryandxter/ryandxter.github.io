import { seedPortfolioData } from "@/lib/seedData"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const result = await seedPortfolioData()

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Data seeded successfully" })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 })
  }
}
