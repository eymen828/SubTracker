import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, ArrowLeft, Users, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import { SubscriptionCard } from "@/components/subscription-card"
import { AddSubscriptionDialog } from "@/components/add-subscription-dialog"
import { UserMenu } from "@/components/user-menu"

export default async function RoomPage({ params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirect("/auth/login")
    }

    const { data: room } = await supabase.from("rooms").select("*").eq("id", params.id).single()

    if (!room) {
      redirect("/rooms")
    }

    // Check if user has access
    const isOwner = room.owner_id === user.id
    const { data: membership } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", params.id)
      .eq("user_id", user.id)
      .single()

    if (!isOwner && !membership) {
      redirect("/rooms")
    }

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("room_id", params.id)
      .order("created_at", { ascending: false })

    const { data: members, count: memberCount } = await supabase
      .from("room_members")
      .select("*", { count: "exact" })
      .eq("room_id", params.id)

    const monthlyTotal =
      subscriptions?.reduce((total, sub) => {
        const amount = Number(sub.amount)
        switch (sub.billing_cycle) {
          case "weekly":
            return total + amount * 4.33
          case "monthly":
            return total + amount
          case "quarterly":
            return total + amount / 3
          case "yearly":
            return total + amount / 12
          default:
            return total
        }
      }, 0) || 0

    const totalMembers = (memberCount || 0) + (isOwner ? 1 : 0)

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Link href="/rooms">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{room.name}</h1>
                {isOwner && <Badge variant="secondary">Owner</Badge>}
                {membership && (
                  <Badge variant="outline" className="capitalize">
                    {membership.role}
                  </Badge>
                )}
              </div>
              {room.description && <p className="text-muted-foreground mt-2">{room.description}</p>}
            </div>
            <div className="flex gap-2 items-center">
              {isOwner && (
                <Link href={`/rooms/${params.id}/settings`}>
                  <Button variant="outline" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <UserMenu userEmail={user.email} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Monthly Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Total per month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptions?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active subscriptions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMembers}</div>
                <p className="text-xs text-muted-foreground mt-1">Total members</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Subscriptions</h2>
            <AddSubscriptionDialog roomId={params.id}>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Subscription</span>
              </Button>
            </AddSubscriptionDialog>
          </div>

          {subscriptions && subscriptions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((subscription) => (
                <SubscriptionCard key={subscription.id} subscription={subscription} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Plus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No subscriptions yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Add subscriptions to this room to start tracking</p>
              <AddSubscriptionDialog roomId={params.id}>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Add Subscription
                </Button>
              </AddSubscriptionDialog>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Room page error:", error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading room</h1>
          <p className="text-muted-foreground mb-6">There was an error loading this room. Please try again.</p>
          <Link href="/rooms">
            <Button>Back to Rooms</Button>
          </Link>
        </div>
      </div>
    )
  }
}
