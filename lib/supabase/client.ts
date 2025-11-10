import { createBrowserClient } from "@supabase/ssr"

let cachedConfig: { url: string; anonKey: string } | null = null

async function getConfig() {
  if (cachedConfig) {
    return cachedConfig
  }

  const response = await fetch("/api/supabase-config")
  if (!response.ok) {
    throw new Error("Failed to fetch Supabase configuration")
  }

  cachedConfig = await response.json()
  return cachedConfig
}

export async function createClient() {
  const config = await getConfig()
  return createBrowserClient(config.url, config.anonKey)
}
