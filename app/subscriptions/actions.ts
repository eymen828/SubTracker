"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function addSubscription(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  const roomId = formData.get("room_id") as string | null

  const subscription = {
    user_id: user.id,
    name: formData.get("name") as string,
    amount: Number.parseFloat(formData.get("amount") as string),
    billing_cycle: formData.get("billing_cycle") as string,
    next_billing_date: formData.get("next_billing_date") as string,
    category: formData.get("category") as string,
    notes: (formData.get("notes") as string) || null,
    status: "active",
    room_id: roomId || null, // Add room_id to subscription
  }

  const { error } = await supabase.from("subscriptions").insert(subscription)

  if (error) {
    console.error("[v0] Error adding subscription:", error)
    throw error
  }

  revalidatePath("/subscriptions")
  if (roomId) {
    revalidatePath(`/rooms/${roomId}`)
  }
}

export async function updateSubscription(id: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  const updates = {
    name: formData.get("name") as string,
    amount: Number.parseFloat(formData.get("amount") as string),
    billing_cycle: formData.get("billing_cycle") as string,
    next_billing_date: formData.get("next_billing_date") as string,
    category: formData.get("category") as string,
    notes: (formData.get("notes") as string) || null,
  }

  const { error } = await supabase.from("subscriptions").update(updates).eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("[v0] Error updating subscription:", error)
    throw error
  }

  revalidatePath("/subscriptions")
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.from("subscriptions").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("[v0] Error deleting subscription:", error)
    throw error
  }

  revalidatePath("/subscriptions")
}
