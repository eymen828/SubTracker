import { NextResponse } from "next/server"
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/get-supabase-url"

export async function GET() {
  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseAnonKey = getSupabaseAnonKey()

    console.log("[v0] Supabase config API:", {
      url: supabaseUrl,
      hasKey: !!supabaseAnonKey,
      keyLength: supabaseAnonKey?.length,
    })

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[v0] Missing Supabase configuration:", { supabaseUrl, hasKey: !!supabaseAnonKey })
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 })
    }

    return NextResponse.json({
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    })
  } catch (error) {
    console.error("[v0] Error in supabase-config route:", error)
    return NextResponse.json(
      {
        error: "Failed to get Supabase configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
