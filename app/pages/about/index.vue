<template>
  <div class="about-page">
    <h1>Our Mission</h1>
    <p>
      At Peak Impact, our mission is to connect passionate volunteers with impactful organizations in Colorado Springs. We strive to create a community where everyone can contribute their time and skills to make a positive difference in the lives of others.
    </p>
  </div>
</template>

<script setup>
  definePageMeta({
    layout: 'landing',
  });
</script>

<style scoped>
.about-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: top;
  padding: 2rem 5rem;
  border-radius: 8px;
}

.about-page h1 {
  color: var(--color-white);
}

.about-page p {
  margin-top: 1rem;
  color: var(--color-white);
  font-size: 1.2rem;
  line-height: 1.6;
}
</style>