// app/plugins/auth.ts

import { useAuthStore } from '../../stores/auth'; 

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();
  const auth = useFirebaseAuth();
  
  console.log("PLUG")
  
  // IMPORTANT: Always start fresh - sign out any existing session
  if (auth && auth.currentUser) {
    console.log("Clearing existing session on app init");
    const { signOut } = await import('firebase/auth');
    try {
      await signOut(auth);
      sessionStorage.clear();
      localStorage.removeItem('firebase:authUser');
      localStorage.removeItem('firebase:authToken');
      // Clear all localStorage keys that start with 'firebase:'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('firebase:')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error clearing auth:', e);
    }
  }
  
  // 1. Start the Firebase listener/watcher
  await authStore.initializeAuth();

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