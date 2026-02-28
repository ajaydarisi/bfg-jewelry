"use client";

import { useEffect } from "react";
import { linkTokenToUser } from "@/lib/push-notifications";

export function PushTokenLinker({ userId }: { userId: string }) {
  useEffect(() => {
    linkTokenToUser(userId);
  }, [userId]);

  return null;
}
