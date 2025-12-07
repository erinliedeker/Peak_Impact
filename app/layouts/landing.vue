<template>
  <div class="landing-layout">
    <header class="landing-header">
      <div class="header-container">
        <h1 class="logo">Peak Impact 🏔️</h1>
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

<style scoped>

:root {
  --landing-header-height: 60px;
  --landing-footer-height: 40px;
}

.landing-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
}
.landing-header {
  height: var(--landing-header-height);
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
  background: white;
}

.landing-main {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
  background-color: var(--color-primary);
}

.landing-main-inner {
  width: 100%;
  height: calc(100vh - var(--landing-header-height) - var(--landing-footer-height));
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

.logo {
  color: var(--color-primary);
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
  color: var(--color-text-main);
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
  background-color: var(--color-primary);
}
</style>