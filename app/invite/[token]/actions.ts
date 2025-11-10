"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function acceptInvite(formData: FormData) {
  const supabase = await createClient()
  const token = formData.get("token") as string

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?redirect=/invite/${token}`)
  }

  const { data: invite } = await supabase.from("room_invites").select("*").eq("invite_token", token).single()

  if (!invite || new Date(invite.expires_at) < new Date()) {
    redirect("/rooms")
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("room_members")
    .select("*")
    .eq("room_id", invite.room_id)
    .eq("user_id", user.id)
    .single()

  if (!existing) {
    const { error } = await supabase.from("room_members").insert({
      room_id: invite.room_id,
      user_id: user.id,
      role: "member",
    })

    if (error) {
      console.error("[v0] Error accepting invite:", error)
      throw error
    }

    // Increment uses
    await supabase
      .from("room_invites")
      .update({ uses: invite.uses + 1 })
      .eq("id", invite.id)
  }

  redirect(`/rooms/${invite.room_id}`)
}
