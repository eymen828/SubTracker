"use client"

import type React from "react"

import { useState } from "react"
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
import { createRoomInvite } from "@/app/rooms/actions"
import { Loader2, Copy, Check } from "lucide-react"

export function ShareRoomDialog({
  roomId,
  roomName,
  children,
}: { roomId: string; roomName: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    const link = await createRoomInvite(roomId)
    setInviteLink(link)
    setIsLoading(false)
  }

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setInviteLink(null)
          setCopied(false)
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{roomName}"</DialogTitle>
          <DialogDescription>Generate an invite link to share this room with others</DialogDescription>
        </DialogHeader>
        {!inviteLink ? (
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Invite Link
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="flex-1" />
                <Button onClick={handleCopy} variant="outline" size="icon">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this link with anyone you want to give access to this room. The link expires in 7 days.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
