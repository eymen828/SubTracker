"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { randomBytes } from "crypto"

export async function createRoom(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  const room = {
    owner_id: user.id,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
  }

  const { error } = await supabase.from("rooms").insert(room)

  if (error) {
    console.error("[v0] Error creating room:", error)
    throw error
  }

  revalidatePath("/rooms")
}

export async function createRoomInvite(roomId: string): Promise<string> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  // Verify ownership
  const { data: room } = await supabase.from("rooms").select("*").eq("id", roomId).eq("owner_id", user.id).single()

  if (!room) {
    throw new Error("Room not found or not authorized")
  }

  const inviteToken = randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  const { error } = await supabase.from("room_invites").insert({
    room_id: roomId,
    created_by: user.id,
    invite_token: inviteToken,
    expires_at: expiresAt.toISOString(),
    max_uses: null,
    uses: 0,
  })

  if (error) {
    console.error("[v0] Error creating invite:", error)
    throw error
  }

  return `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "http://localhost:3000"}/invite/${inviteToken}`
}

export async function removeRoomMember(roomId: string, memberId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  // Verify ownership
  const { data: room } = await supabase.from("rooms").select("*").eq("id", roomId).eq("owner_id", user.id).single()

  if (!room) {
    throw new Error("Not authorized")
  }

  const { error } = await supabase.from("room_members").delete().eq("id", memberId).eq("room_id", roomId)

  if (error) {
    console.error("[v0] Error removing member:", error)
    throw error
  }

  revalidatePath(`/rooms/${roomId}/settings`)
}

export async function deleteRoom(roomId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  // Verify ownership
  const { data: room } = await supabase.from("rooms").select("*").eq("id", roomId).eq("owner_id", user.id).single()

  if (!room) {
    throw new Error("Not authorized")
  }

  const { error } = await supabase.from("rooms").delete().eq("id", roomId)

  if (error) {
    console.error("[v0] Error deleting room:", error)
    throw error
  }

  redirect("/rooms")
}
