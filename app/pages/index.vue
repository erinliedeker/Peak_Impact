<template>
  <div class="page-root">
  <header class="landing-header">
    <div class="left">
      <NuxtLink to="/" class="logo-link">
        <img src="~/assets/images/logo.png" alt="App Logo" class="logo"/>
      </NuxtLink>
      <h1 class="page-title">Peak Impact</h1>
    </div>
    <div class="right">
      <NuxtLink to="/" class="btn btn-primary">Sign In</NuxtLink>
      <NuxtLink to="/" class="btn btn-secondary">Sign Up</NuxtLink>
    </div>
  </header>
  <main>
    <div class="landing-content">
      <img src="~/assets/images/landing-image.png" class="landing-image" alt="two shaking hands in front of a mountain with the words: peak impact"/>
    </div>
  </main>
  </div>
</template>

<script setup>
  definePageMeta({
    layout: false,
  });
</script>

<style scoped>

.page-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.landing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.landing-content {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: top;
  background-color: var(--color-primary);
}

.landing-image {
  object-fit: cover;
}

.left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 40px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.right .btn {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #111827;
}

</style>