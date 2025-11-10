import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Lock } from "lucide-react"
import Link from "next/link"
import { CreateRoomDialog } from "@/components/create-room-dialog"
import { UserMenu } from "@/components/user-menu"

export default async function RoomsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get owned rooms
  const { data: ownedRooms } = await supabase
    .from("rooms")
    .select("*, subscriptions(count)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  // Get shared rooms
  const { data: sharedRooms } = await supabase
    .from("room_members")
    .select("*, rooms(*, subscriptions(count))")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Rooms</h1>
            <p className="text-muted-foreground mt-2">Organize and share subscriptions</p>
          </div>
          <div className="flex gap-2 items-center">
            <CreateRoomDialog>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Create Room</span>
              </Button>
            </CreateRoomDialog>
            <UserMenu userEmail={user.email} />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6" />
              My Rooms
            </h2>
            {ownedRooms && ownedRooms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ownedRooms.map((room) => (
                  <Link key={room.id} href={`/rooms/${room.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle>{room.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {room.description || "No description"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{room.subscriptions?.[0]?.count || 0} subscriptions</span>
                          <span>Owner</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No rooms yet. Create one to organize your subscriptions.
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Shared With Me
            </h2>
            {sharedRooms && sharedRooms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sharedRooms.map((membership) => {
                  const room = membership.rooms as any
                  return (
                    <Link key={membership.id} href={`/rooms/${room.id}`}>
                      <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                          <CardTitle>{room.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {room.description || "No description"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{room.subscriptions?.[0]?.count || 0} subscriptions</span>
                            <span className="capitalize">{membership.role}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No shared rooms yet. Ask someone to share a room with you.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
