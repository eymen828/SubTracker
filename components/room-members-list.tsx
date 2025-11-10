"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { removeRoomMember } from "@/app/rooms/actions"
import { useState } from "react"

interface Member {
  id: string
  user_id: string
  role: string
  profiles: {
    display_name: string | null
    username: string | null
  } | null
}

export function RoomMembersList({ roomId, members, isOwner }: { roomId: string; members: Member[]; isOwner: boolean }) {
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this member from the room?")) return
    setRemovingId(memberId)
    await removeRoomMember(roomId, memberId)
    setRemovingId(null)
  }

  if (!members || members.length === 0) {
    return <p className="text-sm text-muted-foreground">No members yet. Share the room to add members.</p>
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const name = member.profiles?.display_name || member.profiles?.username || "Unknown User"
        const initials = name.slice(0, 2).toUpperCase()

        return (
          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
              </div>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(member.id)}
                disabled={removingId === member.id}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
