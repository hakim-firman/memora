import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching user:", userError);
  }

  try {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .or(`created_by.eq.${user?.id},created_by.is.null`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return (
            request.headers
              .get("cookie")
              ?.split(";")
              .map((cookie) => {
                const [name, ...rest] = cookie.trim().split("=");
                return { name, value: rest.join("=") };
              }) || []
          );
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
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      {
        message:
          (err as { message: string }).message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Folder ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id);

    if (error) throw error;

    return NextResponse.json({
      message: "Folder deleted successfully",
      status: 200,
    });
  } catch (err: unknown) {
    console.error("Error deleting folder:", err);
    return NextResponse.json(
      {
        message:
          (err as { message: string }).message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
