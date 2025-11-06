"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ProfileMenu() {
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const supabase = createClient();

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!session) {
          console.warn("No session found, user not logged in yet");
          setUserEmail(null);
          return;
        }

        setUserEmail(session.user?.email ?? null);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUserEmail(null);
      }
    }

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function onLogout() {
    try {
      await supabase.auth.signOut();
      setUserEmail(null);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  }

  const label = userEmail ?? "Guest";
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "GU";

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
          {userEmail ? "Signed in" : "Not signed in"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {userEmail ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/">My Notes</Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onLogout}
              className="text-red-500 focus:text-red-600 cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/signin">Sign in</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
