"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  console.log("[v0] Login attempt started")

  try {
    const supabase = await createClient()
    console.log("[v0] Supabase client created successfully")

    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    if (!data.email || !data.password) {
      return { error: "Email and password are required" }
    }

    console.log("[v0] Attempting to sign in with email:", data.email)
    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      console.error("[v0] Login error:", error.message)
      return { error: error.message }
    }

    console.log("[v0] Login successful")
    revalidatePath("/", "layout")
  } catch (error) {
    console.error("[v0] Login exception:", error)
    return { error: error instanceof Error ? error.message : "Login failed" }
  }
  redirect("/")
}

export async function signup(formData: FormData) {
  console.log("[v0] Signup attempt started")

  try {
    const supabase = await createClient()
    console.log("[v0] Supabase client created successfully")

    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    console.log("[v0] Attempting to sign up with email:", data.email)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.VERCEL_URL || "http://localhost:3000"}/`,
      },
    })

    if (error) {
      console.error("[v0] Signup error:", error.message)
      return { error: error.message }
    }

    console.log("[v0] Signup successful")
    revalidatePath("/", "layout")
  } catch (error) {
    console.error("[v0] Signup exception:", error)
    return { error: error instanceof Error ? error.message : "Signup failed" }
  }
  redirect("/auth/sign-up-success")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/auth/login")
}
