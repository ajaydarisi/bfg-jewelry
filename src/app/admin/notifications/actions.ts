"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getNotificationHistory() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

export async function searchUsers(query: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10);
  return data || [];
}
