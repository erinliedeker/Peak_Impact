<template>
    <div class="about-volunteers-page">
      <h1>Peak Impact For Volunteers</h1>
      <p>
        At Peak Impact, we believe that volunteers are the heart of our community. We are dedicated to connecting passionate individuals with organizations that need their help. Whether you have a few hours to spare or are looking for a long-term commitment, Peak Impact provides a platform to find meaningful volunteer opportunities that align with your interests and skills.
      </p>
    </div>
</template>

<script setup>
  definePageMeta({
    layout: 'landing',
  });
</script>

<style scoped>
.about-volunteers-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: top;
  padding: 2rem 5rem;
  border-radius: 8px;
}

.about-volunteers-page h1 {
  color: var(--color-white);
}

.about-volunteers-page p {
  margin-top: 1rem;
  color: var(--color-white);
  font-size: 1.2rem;
  line-height: 1.6;
}
</style>