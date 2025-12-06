// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint", 
    "@nuxt/ui", 
    "nuxt-vuefire",
    '@pinia/nuxt',
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  ssr: false,
  routeRules: {
    "/": { prerender: true },
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  vuefire: {
    auth: { 
      enabled: true 
    },
    config: {
      apiKey: "AIzaSyCMfaQ7L26UYE5dX4fX9CWAo0grrXwSNmY",
      authDomain: "peak-impact-67fc1.firebaseapp.com",
      projectId: "peak-impact-67fc1",
      storageBucket: "peak-impact-67fc1.firebasestorage.app",
      messagingSenderId: "64453712256",
      appId: "1:64453712256:web:02e71626e1175420450965",
      measurementId: "G-G9ZF39NCRG",
    },
  },
});
