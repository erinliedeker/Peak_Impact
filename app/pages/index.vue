<template>
  <div class="page-container">
    
    <header class="top-bar">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search events, organizations, or neighborhoods..." 
          class="search-input"
          v-model="searchQuery"
        />
      </div>
      
      <div class="filters">
        <button 
          v-for="cat in categories" 
          :key="cat"
          :class="['filter-btn', { active: activeCategory === cat }]"
          @click="toggleCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>
    </header>

    <div class="content-area">
      
      <div class="map-container">
        <div class="map-placeholder">
          <span class="map-icon">🗺️</span>
          <h3>Interactive Map</h3>
          <p>Map view coming soon. (Leaflet.js integration)</p>
        </div>
      </div>

      <div class="event-list">
        <div class="list-header">
          <h2>Nearby Opportunities</h2>
          <span class="count">{{ filteredEvents.length }} found</span>
        </div>

        <div v-if="eventsStore.isLoading" class="loading-state">
          Loading events...
        </div>

        <div v-else-if="filteredEvents.length === 0" class="empty-state">
          <p>No events found matching your criteria.</p>
        </div>

        <div v-else class="cards-wrapper">
          <div 
            v-for="event in filteredEvents" 
            :key="event.id" 
            class="event-card"
          >
            <div class="card-header">
              <span class="category-badge" :class="event.category.toLowerCase()">
                {{ event.category }}
              </span>
              <span v-if="event.isMicroProject" class="micro-badge">⚡ Micro</span>
            </div>
            
            <h3 class="event-title">{{ event.title }}</h3>
            <p class="org-name">by {{ event.organizationName }}</p>
            
            <div class="event-details">
              <div class="detail-row">
                <span>📍</span> {{ (event.location.lat).toFixed(2) }}, {{ (event.location.lng).toFixed(2) }}
              </div>
              <div class="detail-row">
                <span>🗓️</span> {{ formatDate(event.date) }} • {{ event.time }}
              </div>
            </div>

            <div class="card-actions">
              <NuxtLink :to="`/events/${event.id}`" class="details-btn">
                See Details
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useEventsStore } from '../stores/events';

// 1. Init Store
const eventsStore = useEventsStore();

// 2. Local State for UI interactions
const searchQuery = ref('');
const activeCategory = ref(null);
const categories = ['Environment', 'PublicSafety', 'Social', 'Youth'];

// 3. Fetch Data on Mount
onMounted(() => {
  eventsStore.fetchEvents();
});

// 4. Computed Properties for Filtering
const filteredEvents = computed(() => {
  let events = eventsStore.allEvents;

  // Filter by Category
  if (activeCategory.value) {
    events = events.filter(e => e.category === activeCategory.value);
  }

  // Filter by Search Query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    events = events.filter(e => 
      e.title.toLowerCase().includes(query) || 
      e.organizationName.toLowerCase().includes(query)
    );
  }

  return events;
});

// 5. Actions
const toggleCategory = (cat) => {
  activeCategory.value = activeCategory.value === cat ? null : cat;
};

const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};
</script>

<style scoped>
/* Layout Containers */
.page-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem); /* Subtract padding/margins if needed */
  overflow: hidden; /* Prevent full page scroll, let individual areas scroll */
}

/* Top Bar */
.top-bar {
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #4a5568;
}

.filter-btn:hover {
  background: #f7fafc;
}

.filter-btn.active {
  background: #2b6cb0;
  color: white;
  border-color: #2b6cb0;
}

/* Main Content Split */
.content-area {
  display: flex;
  flex: 1;
  gap: 1.5rem;
  overflow: hidden; /* Important for inner scrolling */
}

/* Map Section */
.map-container {
  flex: 2; /* Takes up 2/3rds of space */
  background-color: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #718096;
}

.map-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Event List Section */
.event-list {
  flex: 1; /* Takes up 1/3rd of space */
  display: flex;
  flex-direction: column;
  min-width: 320px;
  background: white;
  border-left: 1px solid #f0f0f0; /* Optional divider */
  padding-left: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
}

.count {
  font-size: 0.85rem;
  color: #718096;
}

.cards-wrapper {
  overflow-y: auto; /* Enables scrolling for list only */
  padding-right: 5px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2rem;
}

/* Event Card Styles */
.event-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
  background: white;
  transition: transform 0.2s;
}

.event-card:hover {
  border-color: #cbd5e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.category-badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

/* Category Colors */
.category-badge.environment { background: #c6f6d5; color: #22543d; }
.category-badge.publicsafety { background: #fed7d7; color: #822727; }
.category-badge.social { background: #bee3f8; color: #2a4365; }
.category-badge.youth { background: #fefcbf; color: #744210; }

.micro-badge {
  background: #edf2f7;
  color: #4a5568;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.event-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.org-name {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 0.75rem;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #4a5568;
  margin-bottom: 1rem;
}

.details-btn {
  display: block;
  width: 100%;
  text-align: center;
  background: white;
  border: 1px solid #2b6cb0;
  color: #2b6cb0;
  padding: 8px;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.details-btn:hover {
  background: #2b6cb0;
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .content-area {
    flex-direction: column;
  }
  .map-container {
    flex: 0 0 200px; /* Fixed height map on mobile */
    min-height: 200px;
  }
  .page-container {
    height: auto;
    overflow: visible;
  }
  .cards-wrapper {
    overflow-y: visible;
  }
}
</style>