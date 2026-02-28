import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

const API_BASE = typeof window !== "undefined" ? window.location.origin : "";

async function registerToken(token: string, userId?: string) {
  try {
    await fetch(`${API_BASE}/api/notifications/register-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId, platform: "android" }),
    });
  } catch (e) {
    console.error("Failed to register push token:", e);
  }
}

export async function initPushNotifications(userId?: string) {
  if (!Capacitor.isNativePlatform()) return;

  const permResult = await FirebaseMessaging.requestPermissions();
  if (permResult.receive !== "granted") return;

  const { token } = await FirebaseMessaging.getToken();
  await registerToken(token, userId);

  // Listen for token refresh
  FirebaseMessaging.addListener("tokenReceived", async ({ token }) => {
    await registerToken(token, userId);
  });

  // Handle notification tap (app opened from notification)
  FirebaseMessaging.addListener(
    "notificationActionPerformed",
    ({ notification }) => {
      const data = notification.data as Record<string, string> | undefined;
      if (data?.url) {
        window.location.href = data.url;
      }
    }
  );

  // Subscribe to broadcast topic
  await FirebaseMessaging.subscribeToTopic({ topic: "all_users" });
}

export async function linkTokenToUser(userId: string) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { token } = await FirebaseMessaging.getToken();
    await registerToken(token, userId);
  } catch (e) {
    console.error("Failed to link push token to user:", e);
  }
}
