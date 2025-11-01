"use client";

import Image from "next/image";
import SignupForm from "../_components/signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-dvh grid grid-cols-1 md:grid-cols-2">
      {/* Visual panel */}
      <aside className="hidden md:flex bg-secondary items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Image
            src="/images/note.jpg"
            alt="Register UI preview"
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
            <h1 className="text-2xl font-semibold text-pretty">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Sign up to start managing your notes
            </p>
          </header>

          <SignupForm />

          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-primary underline underline-offset-4 hover:no-underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
