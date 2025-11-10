import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Share2, Users } from "lucide-react"
import Link from "next/link"
import { ShareRoomDialog } from "@/components/share-room-dialog"
import { RoomMembersList } from "@/components/room-members-list"
import { DeleteRoomButton } from "@/components/delete-room-button"

export default async function RoomSettingsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: room } = await supabase.from("rooms").select("*").eq("id", params.id).single()

  if (!room || room.owner_id !== user.id) {
    redirect("/rooms")
  }

  const { data: members } = await supabase
    .from("room_members")
    .select("*, profiles(display_name, username)")
    .eq("room_id", params.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/rooms/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Room Settings</h1>
            <p className="text-muted-foreground mt-2">{room.name}</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Room
              </CardTitle>
              <CardDescription>Create an invite link to share this room with others</CardDescription>
            </CardHeader>
            <CardContent>
              <ShareRoomDialog roomId={params.id} roomName={room.name}>
                <Button className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Generate Invite Link
                </Button>
              </ShareRoomDialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members
              </CardTitle>
              <CardDescription>People who have access to this room</CardDescription>
            </CardHeader>
            <CardContent>
              <RoomMembersList roomId={params.id} members={members || []} isOwner={true} />
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Permanently delete this room and all its subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteRoomButton roomId={params.id} roomName={room.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
