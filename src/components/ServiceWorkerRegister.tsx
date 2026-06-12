"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    const isSecureContextForServiceWorker =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!("serviceWorker" in navigator) || !isSecureContextForServiceWorker) {
      return;
    }

    navigator.serviceWorker.register("/pwabuilder-sw.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  }, []);

  return null;
}
