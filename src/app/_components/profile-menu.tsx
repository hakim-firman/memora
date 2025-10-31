"use client"

import * as React from "react"
import Link from "next/link"
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
  const [user, setUser] = React.useState<string | null>(null)

  // Sinkronisasi dengan localStorage
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

  function onLogout() {
    try {
      window.localStorage.removeItem("user")
    } catch {}
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
              <AvatarFallback className="text-[10px] bg-sidebar-primary text-sidebar-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground max-w-[8rem] truncate">
              {label}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs">
          {user ? "Signed in" : "Not signed in"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {user ? (
          <>
            {/* Navigasi menggunakan Link */}
            <DropdownMenuItem asChild>
              <Link href="/">My Notes</Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              asChild
              className="text-red-500 focus:text-red-600"
            >
              <Link href="/signin" onClick={onLogout}>
                Logout
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/signin">Sign in</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
