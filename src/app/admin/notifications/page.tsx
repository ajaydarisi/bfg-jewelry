import { createAdminClient } from "@/lib/supabase/admin";
import { NotificationComposer } from "@/components/admin/notification-composer";
import { NotificationsTable } from "@/components/admin/notifications-table";

export default async function AdminNotificationsPage() {
  const supabase = createAdminClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold md:text-3xl">Notifications</h1>
      <NotificationComposer />
      <NotificationsTable notifications={notifications ?? []} />
    </div>
  );
}
