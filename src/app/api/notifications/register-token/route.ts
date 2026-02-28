import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { token, userId, platform } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("device_tokens").upsert(
      {
        token,
        user_id: userId || null,
        platform: platform || "android",
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "token" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Token registration error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
