<template>
    <div class="about-organizations-page">
      <h1>Peak Impact For Organizations</h1>
      <p>
        At Peak Impact, we understand the vital role that organizations play in driving positive change within our community. We are committed to supporting organizations by connecting them with dedicated volunteers who are eager to contribute their time and skills. Our platform makes it easy for organizations to post volunteer opportunities, manage applications, and engage with a network of passionate individuals ready to make a difference.
      </p>
    </div>
</template>

<script setup>
  definePageMeta({
    layout: 'landing',
  });
</script>

<style scoped>
.about-organizations-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: top;
  padding: 2rem 5rem;
  border-radius: 8px;
}
.about-organizations-page h1 {
  color: var(--color-white);
}
.about-organizations-page p {
  margin-top: 1rem;
  color: var(--color-white);
  font-size: 1.2rem;
  line-height: 1.6;
}
</style>