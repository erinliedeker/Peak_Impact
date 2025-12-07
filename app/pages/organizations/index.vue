<template>
  <div class="orgs-page">
    
    <header class="page-header">
      <div class="header-content">
        <h1>Local Organizations</h1>
        <p>Discover and follow groups making an impact in Colorado Springs.</p>
      </div>
      
      <div class="controls">
        <div class="search-box">
          <span class="icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Find a group..."
          >
        </div>
        
        <select v-model="selectedType" class="type-filter">
          <option value="All">All Types</option>
          <option value="NonProfit">Non-Profits</option>
          <option value="NeighborhoodGroup">Neighborhoods</option>
          <option value="CityDept">City Departments</option>
        </select>
      </div>
    </header>

    <div v-if="isLoading" class="loading status-message loading-box">
      <p>Loading community partners...</p>
    </div>

    <div v-else-if="error" class="status-message error-box">
        <p>🔴 {{ error }}</p>
        <button @click="fetchOrganizations('')">Try Again</button>
    </div>

    <div v-else class="org-grid">
      <OrgCard 
        v-for="org in filteredOrgs" 
        :key="org.id" 
        :org="org" 
      />
      
      <div v-if="filteredOrgs.length === 0" class="empty-state">
        <p>No organizations found matching your search ({{ allOrganizations.length }} total loaded).</p>
        <button @click="resetFilters" class="reset-btn">Clear Filters</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue' // <-- Import necessary Vue features
import { storeToRefs } from 'pinia'
import { useOrgStore } from '~~/stores/orgs' // Adjust path if necessary

// Store Setup
const orgStore = useOrgStore()
const { allOrganizations, isLoading, error } = storeToRefs(orgStore)
const { fetchOrganizations } = orgStore // Only need fetch, follow logic moves to OrgCard

// Local State for Filtering
const searchQuery = ref('')
const selectedType = ref('All')

// 4. Trigger the data fetching action when the component is mounted/initialized
onMounted(() => {
    fetchOrganizations("") 
})

// Filter Logic: Filters the allOrganizations list based on user input
const filteredOrgs = computed(() => {
  let list = allOrganizations.value; // Access the reactive value

  // 1. Filter by Type
  if (selectedType.value !== 'All') {
    list = list.filter(o => o.type === selectedType.value);
  }

  // 2. Filter by Search Text
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(o => 
      o.name.toLowerCase().includes(query) || 
      o.description.toLowerCase().includes(query)
    );
  }

  return list;
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedType.value = 'All';
};
</script>

<style scoped>
/*
  Merged styles: Combining the general cleanup from the second component 
  with the necessary status styles from the first.
*/
.orgs-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--color-border, #e2e8f0);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-content h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary, #3182ce);
}

.header-content p {
  color: var(--color-text-sub, #718096);
}

.controls {
  display: flex;
  gap: 1rem;
}

.search-box {
  position: relative;
}

.search-box input {
  padding: 10px 10px 10px 36px;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  min-width: 250px;
}

.search-box .icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-sub, #718096);
}

.type-filter {
  padding: 10px;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  background: white;
  color: var(--color-text-main, #2d3748);
  cursor: pointer;
}

.org-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Status and Loading */
.loading-box {
  text-align: center;
  padding: 4rem;
  color: var(--color-text-sub, #718096);
}

.error-box {
    margin: 2rem 0;
    padding: 1rem;
    border-radius: 8px;
    color: #E53E3E;
    background-color: #FED7D7;
    border: 1px solid #E53E3E;
    text-align: center;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  border: 1px dashed var(--color-border, #e2e8f0);
  color: var(--color-text-sub, #718096);
}

.reset-btn {
  margin-top: 1rem;
  padding: 8px 16px;
  background: var(--color-bg, #f7fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 6px;
  cursor: pointer;
}
</style>