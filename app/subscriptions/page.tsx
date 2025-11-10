import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SubscriptionCard } from "@/components/subscription-card"
import { AddSubscriptionDialog } from "@/components/add-subscription-dialog"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"

export default async function SubscriptionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .is("room_id", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching subscriptions:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight">Personal Subscriptions</h1>
            <p className="text-muted-foreground mt-2">Your individual recurring expenses</p>
          </div>
          <AddSubscriptionDialog>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Subscription</span>
            </Button>
          </AddSubscriptionDialog>
          <UserMenu userEmail={user.email} />
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
            <h3 className="text-xl font-semibold mb-2">No personal subscriptions yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start tracking your personal recurring expenses by adding your first subscription
            </p>
            <AddSubscriptionDialog>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Add Your First Subscription
              </Button>
            </AddSubscriptionDialog>
          </div>
        )}
      </div>
    </div>
  )
}
