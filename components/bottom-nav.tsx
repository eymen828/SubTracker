"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, CreditCard, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/app/auth/actions"

export function BottomNav() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
            pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link
          href="/rooms"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
            pathname.startsWith("/rooms") ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs font-medium">Rooms</span>
        </Link>

        <Link
          href="/subscriptions"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
            pathname === "/subscriptions" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <CreditCard className="h-5 w-5" />
          <span className="text-xs font-medium">Subscriptions</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </nav>
  )
}
