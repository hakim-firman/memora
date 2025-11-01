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

export default function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      const email = String(formData.get("email") || "").trim()
      const password = String(formData.get("password") || "").trim()

      const supabase = createClient()
      const { error } = await supabase.auth.signUp({ email, password })

      if (error) throw error

      toast.success("Account created successfully! Please check your email to verify your account.")
      router.push("/login")
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
      console.error(error)
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
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="terms" name="terms" required />
            <Label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{" "}
              <a
                href="#"
                className="text-primary underline underline-offset-4 hover:no-underline"
              >
                Terms & Conditions
              </a>
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Continue as guest
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
