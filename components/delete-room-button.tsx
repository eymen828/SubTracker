"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Loader2 } from "lucide-react"
import { deleteRoom } from "@/app/rooms/actions"

export function DeleteRoomButton({ roomId, roomName }: { roomId: string; roomName: string }) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== roomName) return
    setIsDeleting(true)
    await deleteRoom(roomId)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Room</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All subscriptions in this room will also be deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type "{roomName}" to confirm</Label>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={roomName} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={confirmText !== roomName || isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Room
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
