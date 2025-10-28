import { NextResponse } from "next/server"
import { initialNotes } from "@/lib/data/mocks"

export async function GET() {
  return NextResponse.json({ message: 'Hello from Next.js!', data: initialNotes, status: 200 })
}
