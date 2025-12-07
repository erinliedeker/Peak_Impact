<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
// 1. Import your Pinia store
import { useOrgStore } from '../../stores/orgs' 

// 2. Access the store
const orgStore = useOrgStore()

// 3. Use storeToRefs to destructure reactive state properties (for reactivity)
//    and destructure actions directly (they are just functions).
const { allOrganizations, isLoading, error } = storeToRefs(orgStore)
const { fetchOrganizations, toggleFollowOrg } = orgStore

// 4. Trigger the data fetching action when the component is mounted/initialized
//    (In Nuxt, for SSR/prefetching, you might wrap this in useAsyncData, 
//     but calling the action in onMounted is simple for client-side fetch or store-based logic.)
onMounted(() => {
    // You can pass specific query/state here, or rely on the store's defaults ('Homeless Shelter', 'CO')
    fetchOrganizations() 
})

// Helper to determine if an organization is followed
function isFollowed(orgId: number): boolean {
    return orgStore.followedOrganizations.includes(orgId)
}
</script>

<template>
  <div class="organization-page">
    <h1>🏛️ Non-Profit Organizations</h1>
    <p>Data fetched from ProPublica via Pinia Store.</p>

    <div v-if="isLoading" class="status-message loading">
        <p>Loading organizations...</p>
    </div>

    <div v-else-if="error" class="status-message error">
        <p>🔴 {{ error }}</p>
        <button @click="fetchOrganizations()">Try Again</button>
    </div>

    <div v-else-if="allOrganizations.length > 0" class="results-container">
        <h2>Found {{ allOrganizations.length }} Organizations</h2>
        <ul class="organization-list">
            <li v-for="org in allOrganizations" :key="org.id">
                <div class="org-header">
                    <span class="org-name">{{ org.name }}</span>
                    <button 
                        @click="toggleFollowOrg(org.id)"
                        :class="{ 'followed': isFollowed(org.id) }"
                        class="follow-button"
                    >
                        {{ isFollowed(org.id) ? 'Unfollow' : 'Follow' }}
                    </button>
                </div>
                <p class="org-description">{{ org.description }}</p>
                <div class="org-details">
                    <span class="detail-item">EIN: <strong>{{ org.ein || 'N/A' }}</strong></span>
                    <span class="detail-item">Type: {{ org.type }}</span>
                </div>
            </li>
        </ul>
    </div>
    
    <div v-else class="status-message">
        <p>No organizations found for the current search criteria.</p>
    </div>

  </div>
</template>

<style scoped>
.organization-page {
  text-align: center;
  margin-top: 3rem;
  padding: 0 1rem;
}

h1 {
    color: #3182CE;
}

h2 {
    color: #2D3748;
    margin-top: 2rem;
}

.status-message {
    margin: 2rem 0;
    padding: 1rem;
    border-radius: 8px;
}

.status-message.loading {
    color: #718096;
}

.status-message.error {
    color: #E53E3E;
    background-color: #FED7D7;
    border: 1px solid #E53E3E;
}

.organization-list {
    list-style: none;
    padding: 0;
    max-width: 900px;
    margin: 0 auto;
}

.organization-list li {
    background-color: #f7fafc;
    border: 1px solid #e2e8f0;
    margin-bottom: 12px;
    padding: 15px;
    border-radius: 6px;
    text-align: left;
    transition: all 0.2s;
}

.organization-list li:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.org-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.org-name {
    font-weight: bold;
    font-size: 1.1em;
    color: #2D3748;
}

.org-description {
    font-size: 0.9em;
    color: #4A5568;
    margin-bottom: 10px;
}

.org-details {
    display: flex;
    gap: 15px;
    font-size: 0.8em;
    color: #718096;
    border-top: 1px dashed #E2E8F0;
    padding-top: 8px;
}

.follow-button {
    background-color: #4299E1;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 0.85em;
}

.follow-button:hover {
    background-color: #3182CE;
}

.follow-button.followed {
    background-color: #E53E3E;
}

.follow-button.followed:hover {
    background-color: #C53030;
}
</style>