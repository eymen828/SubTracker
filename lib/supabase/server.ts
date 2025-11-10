import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseUrl, getSupabaseAnonKey } from "./get-supabase-url"

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()

  console.log("[v0] Creating server client with URL:", supabaseUrl)

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Missing Supabase credentials: ${JSON.stringify({ supabaseUrl: !!supabaseUrl, anonKey: !!supabaseAnonKey })}`,
    )
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
