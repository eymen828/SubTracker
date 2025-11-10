import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { acceptInvite } from "./actions"

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?redirect=/invite/${params.token}`)
  }

  const { data: invite } = await supabase
    .from("room_invites")
    .select("*, rooms(*)")
    .eq("invite_token", params.token)
    .single()

  if (!invite || new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>This invite link is invalid or has expired.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const room = invite.rooms as any

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Room Invite</CardTitle>
          <CardDescription>You've been invited to join a room</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg">{room.name}</h3>
            {room.description && <p className="text-sm text-muted-foreground mt-1">{room.description}</p>}
          </div>
          <form action={acceptInvite}>
            <input type="hidden" name="token" value={params.token} />
            <Button type="submit" className="w-full">
              Accept Invite
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
