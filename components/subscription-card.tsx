"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { deleteSubscription } from "@/app/subscriptions/actions"
import { useState } from "react"
import { AddSubscriptionDialog } from "./add-subscription-dialog"

interface Subscription {
  id: string
  name: string
  amount: number
  billing_cycle: string
  next_billing_date: string
  category: string
  status: string
  notes?: string
}

export function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this subscription?")) return

    setIsDeleting(true)
    await deleteSubscription(subscription.id)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      entertainment: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      utilities: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      software: "bg-green-500/10 text-green-700 dark:text-green-400",
      fitness: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      food: "bg-red-500/10 text-red-700 dark:text-red-400",
      other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    }
    return colors[category.toLowerCase()] || colors.other
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight">{subscription.name}</h3>
            <Badge variant="secondary" className={`mt-2 ${getCategoryColor(subscription.category)}`}>
              {subscription.category}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AddSubscriptionDialog subscription={subscription}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              </AddSubscriptionDialog>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="text-3xl font-bold">
          ${Number(subscription.amount).toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground ml-2">/ {subscription.billing_cycle}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          Next billing: {format(new Date(subscription.next_billing_date), "MMM d, yyyy")}
        </div>
      </CardFooter>
    </Card>
  )
}
