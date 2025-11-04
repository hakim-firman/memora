import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: folders, error } = await supabase
    .from("folders")
    .select()
    .then((data) => {
      console.log("folders");
      console.log(data);
      return data;
    })
    .catch((error: { message: any }) => {
      console.error("error", error);
      return NextResponse.json({ message: error.message, status: 500 });
    });

  if (error) {
    return NextResponse.json({ message: error.message, status: 500 });
  }

  return NextResponse.json({
    message: "Folders fetched successfully",
    data: folders,
    status: 200,
  });
}
