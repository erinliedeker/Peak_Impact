<template>
  <div class="landing-content">
    <img src="~/assets/images/landing-image.png" class="landing-image" alt="two shaking hands in front of a mountain with the words: peak impact"/>
  </div>
</template>

<script setup>
  definePageMeta({
    layout: 'landing',
  });
</script>

<style scoped>

.landing-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: top;
  background-color: var(--color-primary);
  box-sizing: border-box;
  overflow: hidden;
}

.landing-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
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