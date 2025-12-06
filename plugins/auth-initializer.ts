export default defineNuxtPlugin((nuxtApp) => {
  // Must be called inside the plugin function
  const authStore = useAuthStore(); 

  console.log('[Nuxt Plugin] Calling authStore.initializeAuth()...');

  // CRITICAL: Execute the action here
  authStore.initializeAuth(); 
});