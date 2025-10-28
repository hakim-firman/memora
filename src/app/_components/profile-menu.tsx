
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function ProfileMenu() {
  const router = useRouter()
  const [user, setUser] = React.useState<string | null>(null)

  // sync with localStorage
  React.useEffect(() => {
    const read = () => {
      try {
        const raw = window.localStorage.getItem("user")
        setUser(raw)
      } catch {
        setUser(null)
      }
    }
    read()
    const onStorage = () => read()
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  function onLogin() {
    router.push("/login")
  }

  function onLogout() {
    try {
      window.localStorage.removeItem("user")
    } catch { }
    router.push("/login")
  }

  const label = user ?? "Guest"
  const initials = user?.trim()?.slice(0, 2).toUpperCase() || "GU"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
              <AvatarFallback className="text-[10px] bg-sidebar-primary text-sidebar-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground max-w-[8rem] truncate">{label}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs">{user ? "Signed in" : "Not signed in"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user ? (
          <>
            <DropdownMenuItem onClick={() => router.push("/")}>My Notes</DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="text-red-500 focus:text-red-600">
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={onLogin}>Login</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}