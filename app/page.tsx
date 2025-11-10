import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Calendar, CreditCard, Users } from "lucide-react"
import Link from "next/link"
import { BudgetChart } from "@/components/budget-chart"
import { UpcomingBills } from "@/components/upcoming-bills"
import { UserMenu } from "@/components/user-menu"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: personalSubs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .is("room_id", null)
    .eq("status", "active")

  const { data: ownedRooms } = await supabase.from("rooms").select("id").eq("owner_id", user.id)

  const { data: memberRooms } = await supabase.from("room_members").select("room_id").eq("user_id", user.id)

  const roomIds = [...(ownedRooms?.map((r) => r.id) || []), ...(memberRooms?.map((r) => r.room_id) || [])]

  let roomSubs: any[] = []
  if (roomIds.length > 0) {
    const { data } = await supabase.from("subscriptions").select("*").in("room_id", roomIds).eq("status", "active")
    roomSubs = data || []
  }

  const subscriptions = [...(personalSubs || []), ...roomSubs]

  // Calculate monthly total
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

  // Calculate yearly total
  const yearlyTotal = monthlyTotal * 12

  // Group by category
  const categoryTotals =
    subscriptions?.reduce(
      (acc, sub) => {
        const amount = Number(sub.amount)
        let monthlyAmount = amount
        switch (sub.billing_cycle) {
          case "weekly":
            monthlyAmount = amount * 4.33
            break
          case "quarterly":
            monthlyAmount = amount / 3
            break
          case "yearly":
            monthlyAmount = amount / 12
            break
        }
        acc[sub.category] = (acc[sub.category] || 0) + monthlyAmount
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Budget Dashboard</h1>
            <p className="text-muted-foreground mt-2">Track your subscriptions and spending</p>
          </div>
          <div className="flex gap-2 items-center">
            <Link href="/rooms">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                <Users className="h-5 w-5" />
                <span className="hidden sm:inline">Rooms</span>
              </Button>
            </Link>
            <Link href="/subscriptions">
              <Button size="lg" className="gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="hidden sm:inline">Subscriptions</span>
              </Button>
            </Link>
            <UserMenu userEmail={user.email} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${monthlyTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Yearly Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${yearlyTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subscriptions?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(categoryTotals).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Different categories</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <BudgetChart categoryTotals={categoryTotals} />
          <UpcomingBills subscriptions={subscriptions || []} />
        </div>
      </div>
    </div>
  )
}
