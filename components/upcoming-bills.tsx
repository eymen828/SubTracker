"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { format, differenceInDays, parseISO } from "date-fns"

interface Subscription {
  id: string
  name: string
  amount: number
  next_billing_date: string
  category: string
}

interface UpcomingBillsProps {
  subscriptions: Subscription[]
}

export function UpcomingBills({ subscriptions }: UpcomingBillsProps) {
  const sortedSubscriptions = [...subscriptions]
    .sort((a, b) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime())
    .slice(0, 5)

  const getDaysUntil = (date: string) => {
    return differenceInDays(parseISO(date), new Date())
  }

  const getDaysUntilBadge = (days: number) => {
    if (days < 0) return <Badge variant="destructive">Overdue</Badge>
    if (days === 0) return <Badge variant="destructive">Today</Badge>
    if (days === 1) return <Badge variant="destructive">Tomorrow</Badge>
    if (days <= 7)
      return <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400">In {days} days</Badge>
    return <Badge variant="secondary">In {days} days</Badge>
  }

  if (sortedSubscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No upcoming bills</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSubscriptions.map((subscription) => {
            const daysUntil = getDaysUntil(subscription.next_billing_date)
            return (
              <div key={subscription.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1">
                  <div className="font-semibold">{subscription.name}</div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(parseISO(subscription.next_billing_date), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getDaysUntilBadge(daysUntil)}
                  <div className="text-lg font-bold">${Number(subscription.amount).toFixed(2)}</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
