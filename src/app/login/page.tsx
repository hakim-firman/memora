import Image from "next/image"
import LoginForm from "../_components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid grid-cols-1 md:grid-cols-2">
      {/* Visual panel */}
      <aside className="hidden md:flex bg-secondary items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Image
            src="/images/notes-preview.png"
            alt="Notes UI preview"
            width={800}
            height={600}
            className="rounded-lg shadow-lg border border-border"
            priority
          />
        </div>
      </aside>

      {/* Form panel */}
      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-pretty">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue to your notes</p>
          </header>
          <LoginForm />
          <p className="mt-6 text-sm text-muted-foreground">
            Don{"'"}t have an account?{" "}
            <a href="#" className="text-primary underline underline-offset-4 hover:no-underline">
              Create one
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
