<template>
  <div class="landing-layout">
    <header class="landing-header">
      <div class="container">
        <h1 class="logo">Peak Impact 🏔️</h1>
        <div class="auth-buttons">
          <NuxtLink to="/login" class="btn btn-ghost">Log In</NuxtLink>
          <NuxtLink to="/signup" class="btn btn-primary">Sign Up</NuxtLink>
        </div>
      </div>
    </header>

    <main>
      <slot /> </main>

    <footer class="landing-footer">
      <p>&copy; 2025 Peak Impact. Built for Colorado Springs.</p>
    </footer>
  </div>
</template>

<style scoped>
.landing-header {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
  background: white;
}

.container {
  max-width: 1200px;
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
  text-align: center;
  padding: 2rem;
  color: var(--color-text-sub);
  margin-top: 4rem;
}
</style>