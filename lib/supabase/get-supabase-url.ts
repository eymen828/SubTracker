export function getSupabaseUrl(): string {
  // Try to get from environment first
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }

  // Extract from POSTGRES_URL
  const postgresUrl = process.env.POSTGRES_URL
  if (!postgresUrl) {
    throw new Error("POSTGRES_URL is not defined")
  }

  // Parse the URL to extract the project reference
  // Format: postgres://postgres.projectref:pass@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
  // We need the projectref part to construct: https://projectref.supabase.co
  try {
    const url = new URL(postgresUrl)
    const username = url.username

    const projectRefMatch = username.match(/^postgres\.(.+)$/)
    if (!projectRefMatch) {
      throw new Error("Could not extract project ref from username")
    }

    const projectRef = projectRefMatch[1]
    console.log("[v0] Extracted Supabase URL:", `https://${projectRef}.supabase.co`)
    return `https://${projectRef}.supabase.co`
  } catch (error) {
    console.error("[v0] Error extracting Supabase URL:", error)
    throw new Error("Could not extract Supabase URL from POSTGRES_URL")
  }
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
}
