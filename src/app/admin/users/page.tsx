import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const [{ data: users }, { data: authData }, { data: { user: currentUser } }] =
    await Promise.all([
      adminClient
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      adminClient.auth.admin.listUsers(),
      supabase.auth.getUser(),
    ]);

  const bannedUserIds = (authData?.users ?? [])
    .filter((u) => u.banned_until && new Date(u.banned_until) > new Date())
    .map((u) => u.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>
      <UsersTable
        users={users ?? []}
        bannedUserIds={bannedUserIds}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}
