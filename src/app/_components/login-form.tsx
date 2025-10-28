"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"


export default function LoginForm() {
  const router = useRouter()
  // const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      const email = String(formData.get("email") || "").trim()
      await new Promise((r) => setTimeout(r, 600))
      const supabase = createClient()

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: String(formData.get("password") || "").trim(),
        });
        if (error) throw error;
        // Update this route to redirect to an authenticated route. The user already has an active session.
        window.localStorage.setItem("user", email || "user@example.com")
        toast.info("Sign In Successfully")
        router.push("/");
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "An error occurred")
        console.error(error)
      } finally {
        setLoading(false);
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <form onSubmit={onSubmit} className="contents">
        <CardContent className="pt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-primary underline underline-offset-4 hover:no-underline">
                Forgot password?
              </a>
            </div>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="remember" name="remember" />
            <Label htmlFor="remember" className="text-sm text-muted-foreground">
              Remember me
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => router.push("/")}>
            Continue as guest
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
