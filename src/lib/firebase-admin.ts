import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

function getApp() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY!
    );
    return initializeApp({ credential: cert(serviceAccount) });
  }
  return getApps()[0];
}

export function getFirebaseMessaging() {
  return getMessaging(getApp());
}
