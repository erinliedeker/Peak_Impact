<template>
  <div class="landing-content">
    <img class="landing-image" src="~/assets/images/landing-image.png" alt="two shaking hands in front of a mountain with the words: peak impact"/>
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
  background-color: #1b273e;
  box-sizing: border-box;
  overflow: hidden;
}

.landing-image {
  height: 960 px;
  width: auto;
}

.left {
  display: flex;
  align-items: center;
  gap: 1rem;
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