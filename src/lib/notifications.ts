import { createAdminClient } from "@/lib/supabase/admin";
import { getFirebaseMessaging } from "@/lib/firebase-admin";

const ORDER_STATUS_MESSAGES: Record<
  string,
  { title: string; body: (orderNumber: string) => string }
> = {
  paid: {
    title: "Payment Confirmed",
    body: (n) => `Your payment for order ${n} has been confirmed.`,
  },
  processing: {
    title: "Order Being Processed",
    body: (n) => `Your order ${n} is being prepared.`,
  },
  shipped: {
    title: "Order Shipped!",
    body: (n) => `Your order ${n} has been shipped and is on the way!`,
  },
  delivered: {
    title: "Order Delivered",
    body: (n) => `Your order ${n} has been delivered. Enjoy!`,
  },
  cancelled: {
    title: "Order Cancelled",
    body: (n) => `Your order ${n} has been cancelled.`,
  },
  refunded: {
    title: "Refund Processed",
    body: (n) => `A refund for order ${n} has been processed.`,
  },
};

export async function sendOrderStatusNotification(
  orderId: string,
  newStatus: string
) {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("order_number, user_id")
    .eq("id", orderId)
    .single();

  if (!order?.user_id) return;

  const template = ORDER_STATUS_MESSAGES[newStatus];
  if (!template) return;

  const { data: tokens } = await supabase
    .from("device_tokens")
    .select("token")
    .eq("user_id", order.user_id)
    .eq("is_active", true);

  if (!tokens?.length) return;

  const messaging = getFirebaseMessaging();
  const title = template.title;
  const body = template.body(order.order_number);

  try {
    const response = await messaging.sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: { title, body },
      data: {
        type: "order_update",
        orderId,
        url: `/account/orders/${orderId}`,
      },
      android: {
        priority: "high",
        notification: { channelId: "orders", sound: "default" },
      },
    });

    // Deactivate stale tokens
    response.responses.forEach((resp, idx) => {
      if (
        resp.error?.code === "messaging/registration-token-not-registered"
      ) {
        supabase
          .from("device_tokens")
          .update({ is_active: false })
          .eq("token", tokens[idx].token)
          .then(() => {});
      }
    });

    // Log to notifications table
    await supabase.from("notifications").insert({
      title,
      body,
      type: "order_update",
      target_type: "user",
      target_value: order.user_id,
      status: "sent",
      sent_count: response.successCount,
      failed_count: response.failureCount,
      sent_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Failed to send order notification:", e);
  }
}
