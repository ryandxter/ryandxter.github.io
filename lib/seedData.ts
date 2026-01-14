import { cvData } from "../data/cv-data"
import { createClient } from "@/lib/supabase/server"

export async function seedPortfolioData() {
  const supabase = await createClient()

  // Check if portfolio_info exists
  const { data: existingData } = await supabase.from("portfolio_info").select("id").single()

  const portfolioData = {
    name: cvData.personal.name,
    title: cvData.personal.title,
    email: cvData.personal.email,
    location: cvData.personal.location,
    bio: cvData.personal.bio,
  }

  if (existingData) {
    // Update existing record
    const { error } = await supabase
      .from("portfolio_info")
      .update(portfolioData)
      .eq("id", existingData.id)

    if (error) {
      console.error("Error updating portfolio_info:", error)
      return { error: error.message }
    }

    console.log("✅ Portfolio info updated successfully")
  } else {
    // Insert new record
    const { error } = await supabase.from("portfolio_info").insert([portfolioData])

    if (error) {
      console.error("Error inserting portfolio_info:", error)
      return { error: error.message }
    }

    console.log("✅ Portfolio info created successfully")
  }

  // Sync social links
  const { data: existingSocial } = await supabase.from("social_links").select("id")

  if (existingSocial && existingSocial.length > 0) {
    // Delete existing social links
    const { error: deleteError } = await supabase
      .from("social_links")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")

    if (deleteError) {
      console.error("Error deleting old social links:", deleteError)
    }
  }

  // Insert new social links
  const { error: socialError } = await supabase.from("social_links").insert(
    cvData.social.map((link) => ({
      label: link.label,
      href: link.href,
      value: link.value,
    }))
  )

  if (socialError) {
    console.error("Error inserting social links:", socialError)
    return { error: socialError.message }
  }

  console.log("✅ Social links synced successfully")

  return { success: true }
}
