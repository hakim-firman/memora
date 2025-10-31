import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createClient(cookieStore)
  const { data: notes, error } = await supabase.from("notes").select()
  .then(data => {
    console.log('notes')
    console.log(data)
    return data
  })  
  .catch(error => {
    console.error('error', error)
    return NextResponse.json({ message: error.message, status: 500 })
  })

  if (error) {
    return NextResponse.json({ message: error.message, status: 500 })
  }

  return NextResponse.json({
    message: 'Notes fetched successfully',
    data: notes,
    status: 200,
  })
}
