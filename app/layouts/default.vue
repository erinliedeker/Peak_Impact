<template>
  <div class="app-container">
    
    <NavSidebar /> 

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
  display: flex;
  height: 100vh; /* Full viewport height */
  overflow: hidden; /* Prevent body scroll */
  background-color: var(--color-bg);
}

.main-column {
  /* This column takes up all remaining space to the right of the sidebar */
  flex: 1; 
  display: flex;
  flex-direction: column;
  margin-left: 260px; /* IMPORTANT: Matches sidebar width to prevent overlap */
  height: 100%;
}

.page-content {
  flex: 1; /* Takes up remaining height below Top Bar */
  overflow-y: auto; /* Allows content to scroll while Sidebar/TopBar stay fixed */
  padding: 2rem;
}
</style>