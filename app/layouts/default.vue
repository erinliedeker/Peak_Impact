<template>
  <div class="app-layout">
    <NavSidebar /> <main class="main-content">
      <slot /> </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.main-content {
  margin-left: 260px; /* Must match sidebar width */
  flex: 1;
  padding: 2rem;
}
</style>