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
  grid-template-columns: 309px 1fr; 
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-bg);
  box-sizing: border-box;
}

.sidebar-wrapper {
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
}

.main-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: auto;
  position: relative;
  min-width: 0;
}

.page-content {
  flex: 1 1 auto;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0;
}
</style>