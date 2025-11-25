export function getSupabaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }

  // Extract from POSTGRES_URL (server-side only)
  const postgresUrl = process.env.POSTGRES_URL
  if (!postgresUrl) {
    console.error("[v0] POSTGRES_URL is not defined")
    return "https://dmquuzhztnrafhzflwkd.supabase.co" // Fallback
  }

  // Parse the URL to extract the project reference
  // Format: postgres://postgres.projectref:pass@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
  try {
    const url = new URL(postgresUrl)
    const username = url.username

    const projectRefMatch = username.match(/^postgres\.(.+)$/)
    if (!projectRefMatch) {
      console.error("[v0] Could not extract project ref from username")
      return "https://dmquuzhztnrafhzflwkd.supabase.co" // Fallback
    }

    const projectRef = projectRefMatch[1]
    return `https://${projectRef}.supabase.co`
  } catch (error) {
    console.error("[v0] Error extracting Supabase URL:", error)
    return "https://dmquuzhztnrafhzflwkd.supabase.co" // Fallback
  }
}

export function getSupabaseAnonKey(): string {
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    ""

  if (!key) {
    console.error("[v0] Missing Supabase Anon Key!")
    console.error("[v0] Please set one of these environment variables in Vercel:")
    console.error("[v0]   - SUPABASE_ANON_KEY")
    console.error("[v0]   - NEXT_PUBLIC_SUPABASE_ANON_KEY")
    console.error("[v0] Or connect the Supabase integration in your Vercel project.")
    // Return empty string instead of throwing to allow app to start
    return ""
  }

  return key
}
