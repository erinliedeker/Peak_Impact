<template>
  <div class="landing-layout">
    <header class="landing-header">
      <div class="header-container">
        <div class="left">
          <NuxtLink to="/" class="logo-text">Peak Impact</NuxtLink>
          <div v-if="route.fullPath === '/'">
            <NuxtLink to="/about" class="btn btn-ghost" >About</NuxtLink>
          </div>
          <div v-else class="about-buttons">
            <NuxtLink to="/about/volunteers" class="btn btn-ghost" >Volunteers</NuxtLink>
            <NuxtLink to="/about/organizations" class="btn btn-ghost" >Organizations</NuxtLink>
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
  --landing-footer-height: 40px;
}

.landing-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.landing-header {
  height: var(--landing-header-height);
  padding: 1rem 0;
  background: #1b273e;
  color: var(--color-white);
}

.landing-header .left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.landing-main {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #1b273e;
}

.landing-main-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
}

.header-container {
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.logo-text{
  color: var(--color-white);
  font-size: 1.5rem;
  font-weight: 800;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  margin-left: 10px;
}

.btn-ghost {
  color: var(--color-white);
  border: 1px solid var(--color-white);
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
}

.landing-footer {
  height: var(--landing-footer-height);
  text-align: center;
  padding: 2rem;
  color: var(--color-accent);
  background-color: #1b273e;
}
</style>