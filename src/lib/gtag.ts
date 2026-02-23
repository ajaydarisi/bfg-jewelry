export const GA_MEASUREMENT_ID = "G-NKL5JQS5W6";

declare global {
  interface Window {
    gtag: (
      command: "event" | "config" | "js",
      targetOrName: string | Date,
      params?: Record<string, string | number | boolean>
    ) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}
