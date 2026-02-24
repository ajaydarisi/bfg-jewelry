"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

export function CapacitorInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#b8860b" }).catch(() => {});
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});

    SplashScreen.hide().catch(() => {});

    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    App.addListener("appUrlOpen", ({ url }) => {
      // Handle OAuth deep link callbacks
      if (
        url.includes("/api/auth/callback") ||
        url.startsWith("bhagyalakshmifuturegold://auth")
      ) {
        Browser.close().catch(() => {});
        // Navigate the webview to the callback URL so the server
        // can exchange the auth code and set the session
        const parsed = new URL(url);
        window.location.href = `${window.location.origin}${parsed.pathname}${parsed.search}`;
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, []);

  return null;
}
