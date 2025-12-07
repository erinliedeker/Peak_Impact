// app/plugins/auth.ts

import { useAuthStore } from '../../stores/auth'; 

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();
  console.log("PLUG")
  
  // 1. Start the Firebase listener/watcher
  authStore.initializeAuth();

  // 2. Wait until the listener has run for the first time
  // This ensures the Pinia state (isLoggedIn, profile, etc.) is correct 
  // before the application proceeds to render.
  if (!authStore.isAuthInitialized) {
    console.log("PLUG")
    // You can use the nuxtApp hook to wait for state change, 
    // or just a simple promise resolver for a clean wait.
    
    // We create a promise that resolves when isAuthInitialized becomes true.
    await new Promise<void>((resolve) => {
      const stopWatch = watch(() => authStore.isAuthInitialized, (isReady) => {
        if (isReady) {
          stopWatch(); // Stop watching once it's ready
          resolve();
        }
      }, { immediate: true }); 
    });
  }

  console.log('✅ [Auth Initializer Plugin] Finished waiting for Firebase status.');
  // The plugin will now complete, and the app will hydrate with the correct state.
});