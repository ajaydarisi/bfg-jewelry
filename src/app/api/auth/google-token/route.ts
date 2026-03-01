import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { id_token, next } = await request.json();

    if (!id_token || typeof id_token !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing id_token" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: id_token,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    // Only allow relative paths to prevent open redirects
    const safeNext =
      typeof next === "string" && next.startsWith("/") ? next : "/";

    return NextResponse.json({ success: true, next: safeNext });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
