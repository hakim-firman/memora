import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createClient(cookieStore)
  const { data: folders, error } = await supabase.from("folders").select()
  .then(data => {
    console.log('folders')
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
    message: 'Folders fetched successfully',
    data: folders,
    status: 200,
  })
}
