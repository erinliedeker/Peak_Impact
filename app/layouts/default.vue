<template>
  <div class="app-container">
    
    <div class="sidebar-wrapper">
      <NavSidebar />
    </div>

    <div class="main-column">
      <Header />
      <main class="page-content">
        <slot />
      </main>
    </div>

  </div>
</template>

<style scoped>
.app-container {
  display: grid;
  /* Updated to 309px to match your preferred sidebar width */
  grid-template-columns: 309px 1fr; 
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg); /* Kept your bg color */
}

.sidebar-wrapper {
  /* This ensures the wrapper stays 309px and handles its own scrolling */
  overflow-y: auto;
  border-right: 1px solid var(--color-border); /* Optional: visual separation */
}

.main-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}
</style>