"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { addSubscription, updateSubscription } from "@/app/subscriptions/actions"

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

interface AddSubscriptionDialogProps {
  children: React.ReactNode
  subscription?: Subscription
  roomId?: string // Add roomId prop for room-based subscriptions
}

export function AddSubscriptionDialog({ children, subscription, roomId }: AddSubscriptionDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    if (roomId) {
      formData.append("room_id", roomId)
    }

    try {
      if (subscription) {
        await updateSubscription(subscription.id, formData)
      } else {
        await addSubscription(formData)
      }
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving subscription:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{subscription ? "Edit Subscription" : "Add Subscription"}</DialogTitle>
          <DialogDescription>
            {subscription ? "Update your subscription details" : "Add a new recurring expense to track"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Netflix, Spotify, etc."
              defaultValue={subscription?.name}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="9.99"
                defaultValue={subscription?.amount}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Billing Cycle</Label>
              <Select name="billing_cycle" defaultValue={subscription?.billing_cycle || "monthly"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={subscription?.category || "other"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_billing_date">Next Billing Date</Label>
              <Input
                id="next_billing_date"
                name="next_billing_date"
                type="date"
                defaultValue={subscription?.next_billing_date}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any additional notes..."
              defaultValue={subscription?.notes}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : subscription ? "Update" : "Add Subscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
