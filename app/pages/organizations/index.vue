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

    <div v-if="orgStore.isLoading" class="loading">
      Loading community partners...
    </div>

    <div v-else class="org-grid">
      <OrgCard 
        v-for="org in filteredOrgs" 
        :key="org.id" 
        :org="org" 
      />
      
      <div v-if="filteredOrgs.length === 0" class="empty-state">
        <p>No organizations found matching your search.</p>
        <button @click="resetFilters" class="reset-btn">Clear Filters</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useOrgStore } from '../stores/orgs';

const orgStore = useOrgStore();
const searchQuery = ref('');
const selectedType = ref('All');

// Fetch data when page loads
onMounted(() => {
  orgStore.fetchOrganizations();
});

// Filter Logic
const filteredOrgs = computed(() => {
  let list = orgStore.allOrganizations;

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
.orgs-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-content h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
}

.header-content p {
  color: var(--color-text-sub);
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
  border: 1px solid var(--color-border);
  border-radius: 8px;
  min-width: 250px;
}

.search-box .icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-sub);
}

.type-filter {
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: white;
  color: var(--color-text-main);
  cursor: pointer;
}

.org-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  border: 1px dashed var(--color-border);
  color: var(--color-text-sub);
}

.reset-btn {
  margin-top: 1rem;
  padding: 8px 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: var(--color-text-sub);
}
</style>