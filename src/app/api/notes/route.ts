import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({
      message: "Guest mode",
      data: [],
      status: 200,
    });
  }

  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ message: error.message, status: 500 });
  }

  return NextResponse.json({
    message: "Notes fetched successfully",
    data: notes,
    status: 200,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { message: "Unauthorized", status: 401 },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, content, folder } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          title,
          content: content || "",
          folder: folder || null,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: "Note created successfully",
      data,
      status: 201,
    });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, folder } = body;

    const { data, error } = await supabase
      .from("notes")
      .update({
        title,
        content,
        folder: folder || null,
      })
      .eq("id", id)
      .eq("created_by", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: "Note updated successfully",
      data,
      status: 200,
    });
  } catch (err: any) {
    console.error("Error updating note:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id);

    if (error) throw error;

    return NextResponse.json({
      message: "Note deleted successfully",
      status: 200,
    });
  } catch (err: any) {
    console.error("Error deleting note:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
