<template>
  <div class="landing-layout">
    <header class="landing-header">
      <div class="header-container">
        <div class="left">
          <NuxtLink to="/" class="logo-text">Peak Impact</NuxtLink>
          
          <div class="about-buttons">
            <NuxtLink to="/about/volunteers" class="btn btn-ghost" :class="{'active-link': route.path === '/about/volunteers'}">Volunteers</NuxtLink>
            <NuxtLink to="/about/organizations" class="btn btn-ghost" :class="{'active-link': route.path === '/about/organizations'}">Organizations</NuxtLink>
            <NuxtLink to="/about/teams" class="btn btn-ghost" :class="{'active-link': route.path === '/about/teams'}">Teams</NuxtLink>
          </div>
          </div>
        <div class="auth-buttons">
          <NuxtLink to="/login" class="btn btn-ghost">Log In</NuxtLink>
          <NuxtLink to="/signup" class="btn btn-primary">Sign Up</NuxtLink>
        </div>
      </div>
    </header>

    <main class="landing-main">
      <div class="landing-main-inner">
        <slot /> 
      </div>
    </main>

    <footer class="landing-footer">
      <p>&copy; 2025 Peak Impact. Built for Colorado Springs.</p>
    </footer>
  </div>
</template>

<script setup>
  import { useRoute } from 'vue-router';
  const route = useRoute();
</script>

<style scoped>

:root {
  --landing-header-height: 60px;
  --landing-footer-padding: 2rem;
  --color-accent: #3b82f6; /* Defined for button styles */
  --color-active-link: #60a5fa; /* Color for active/hover states */
}

.landing-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; 
  background-color: #0f172a; 
}

.landing-header {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%;
  min-height: var(--landing-header-height);
  padding: 0; 
  background: #1b273e;
  color: white;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.header-container {
  margin: 0 auto;
  max-width: 1400px;
  min-height: 60px;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.landing-main {
  margin-top: var(--landing-header-height); 
  flex-grow: 1; 
  display: flex; 
  align-items: flex-start; 
  justify-content: center;
  box-sizing: border-box;
}

.landing-main-inner {
  width: 100%;
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: flex-start;
  box-sizing: border-box;
}

.landing-footer {
  text-align: center;
  padding: var(--landing-footer-padding) 2rem;
  color: #94a3b8; 
  background-color: #1b273e;
  border-top: 1px solid #334155;
  margin-top: auto; 
}

.landing-header .left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem; /* Space between logo and buttons */
}

/* New button group container */
.about-buttons {
    display: flex;
    gap: 0.5rem; /* Space between the new category buttons */
}

.logo-text{
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
}

.btn {
  padding: 8px 12px; /* Slightly reduced horizontal padding for 3 buttons */
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  /* Removed margin-left to use gap property on parents */
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.btn-ghost {
  color: white;
  border: 1px solid transparent;
}

.btn-ghost:hover {
  border-color: var(--color-active-link);
  color: var(--color-active-link);
}

/* Active state for navigation links */
.active-link {
    color: var(--color-active-link) !important;
    border-color: var(--color-active-link) !important;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>