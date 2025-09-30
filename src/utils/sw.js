export function unregisterSWs() {
  // Kill any old service workers that might be caching blank pages
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister().then(() => {
          console.log("✅ Service worker unregistered");
          // Force a reload once to clear cache completely
          window.location.reload();
        });
      }
    });
  }
}
