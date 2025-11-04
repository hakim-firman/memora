import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { create } from "domain";

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

export async function POST(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers
            .get("cookie")
            ?.split(";")
            .map((cookie) => {
              const [name, ...rest] = cookie.trim().split("=");
              return { name, value: rest.join("=") };
            }) || [];
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No user found", userError);
    return NextResponse.json(
      { message: "Unauthorized", status: 401 },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Folder name is required", status: 400 },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("folders")
      .insert([{ name: name.trim(), created_by: user.id, is_private: false }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: "Folder created successfully",
      data,
      status: 201,
    });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
