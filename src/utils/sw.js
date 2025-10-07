// src/utils/sw.js
import { registerSW } from "virtual:pwa-register";

/**
 * Registers the app's service worker (for PWA).
 */
export function initSW() {
  registerSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      console.log("🧠 Service worker registered:", swUrl);
      console.log("registration :>> ", registration);
    },
    onRegisterError(error) {
      console.error("⚠️ SW registration failed:", error);
    },
  });
}

/**
 * Unregisters all service workers — safe for IndexedDB data.
 * This only clears the cached build, not your stored data.
 */
export async function unregisterOldSWs() {
  if ("serviceWorker" in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length > 0) {
        console.log("🧹 Cleaning up old service workers...");
        await Promise.all(regs.map((r) => r.unregister()));
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (err) {
      console.error("Failed to unregister SWs:", err);
    }
  }
}

/**
 * Handles app crashes and triggers SW cleanup automatically.
 */
export function enableSWRecovery() {
  window.addEventListener("error", (e) => {
    console.error("💥 App crash detected:", e.message);
    unregisterOldSWs();
  });
}
