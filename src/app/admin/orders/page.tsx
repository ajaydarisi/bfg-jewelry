import { createAdminClient } from "@/lib/supabase/admin";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .range(0, 99);

  // Gather user emails
  const userIds = [
    ...new Set(
      (orders ?? []).map((o) => o.user_id).filter(Boolean) as string[]
    ),
  ];

  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, email").in("id", userIds)
    : { data: [] };

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.email])
  );

  const ordersWithEmail = (orders ?? []).map((o) => ({
    ...o,
    customer_email: o.user_id ? profileMap[o.user_id] ?? "Unknown" : "Guest",
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold md:text-3xl">Orders</h1>
      <OrdersTable orders={ordersWithEmail} />
    </div>
  );
}
