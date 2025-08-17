import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch all posts from ai_generations table for the current user
    const { data: posts, error } = await supabase
      .from("ai_generations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error in all-posts route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 