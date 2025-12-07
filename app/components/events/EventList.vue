<template>
  <div class="event-list" role="list" aria-label="Event list">

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading events...</p>
    </div>
    <div v-else-if="sortedEvents.length === 0" class="empty">No events match the current filters.</div>

    <ul v-else class="list" role="list">
      <li
        v-for="event in sortedEvents"
        :key="event.id"
        :class="['event-item', { 'selected': event.id === activeId}]"
        role="listitem"
        @click="$emit('select', event); onClick(event)"
      >
        <div class="avatar" :class="getCategoryClass(event.category)">
          <Icon :name="getCategoryIcon(event.category)" class="category-icon" />
        </div>
        <div class="meta">
          <div class="date-time">{{ formatDate(event.date) }}</div>
          <div class="name">{{ event.title }}</div>
          <div class="organizer">By {{ event.organizationName || 'Unknown' }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// Assuming you have an Icon component imported here or globally available
// import { Icon } from '#components' 

const props = defineProps({
  events: { 
    type: Array, 
    default: () => [] 
  },
  loading: { 
    type: Boolean, 
    default: false 
  },
  // Corrected the type to Date and default to a Date instance
  date: { 
    type: Date, 
    default: () => new Date() 
  }, 
  defaultAvatar: { 
    type: String, 
    default: '/assets/avatar-placeholder.png' 
  }
})

const internalSelected = ref(null)
const activeId = computed(() => internalSelected.value)

function onClick(event) {
  internalSelected.value = event.id
}

/**
 * Sorting Logic: Sorts events by their date property in ascending order.
 * Assumes each event object has a 'date' property that can be compared (e.g., a Date object or ISO string).
 */
const sortedEvents = computed(() => {
  // If loading or no events, return empty array immediately
  if (props.loading || props.events.length === 0) {
    return []
  }

  // Use a shallow copy to avoid mutating the original prop
  return [...props.events].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateA - dateB
  })
})


// --- Utility Functions ---

function formatDate(dateString) {
  const date = new Date(dateString);
  // Example formatting: "Mar 15, 2026, 10:00 AM"
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getCategoryIcon(category) {
  switch (category) {
    case 'Environment': return 'heroicons:tree';
    case 'Social': return 'heroicons:hand-raised';
    case 'PublicSafety': return 'heroicons:shield-check';
    case 'Youth': return 'heroicons:user-group';
    case 'Arts': return 'heroicons:paint-brush';
    default: return 'heroicons:sparkles'; 
  }
}

function getCategoryClass(category) {
    return (category || 'default').toLowerCase();
}
</script>

<style scoped>
.event-list {
  min-height: 360px;
  overflow-y: auto;
  display: flex;
  align-items: stretch;
}

.list {
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.event-item {
  width: 100%;
  /* Increased min-height for bigger cards */
  min-height: 6.5rem; 
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background .12s ease;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  /* Increased padding */
  padding: 16px 18px; 
  gap: 16px; /* Increased gap */
  box-sizing: border-box;
}

.event-item.selected {
  background-color: rgba(142, 137, 137, 0.03);
}

.event-item:hover { background: rgba(142, 137, 137, 0.03); }

/* --- ICON STYLING --- */

.avatar {
  /* Slightly increased avatar size */
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white; 
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.category-icon {
  width: 28px; /* Slightly larger icon */
  height: 28px;
}

/* Category-specific colors remain the same */
.avatar.environment { background-color: #10B981; } 
.avatar.social { background-color: #3B82F6; }      
.avatar.publicsafety { background-color: #F59E0B; } 
.avatar.youth { background-color: #8B5CF6; }        
.avatar.arts { background-color: #EC4899; }         
.avatar.default { background-color: #6B7280; }      

/* --- METADATA STYLING --- */

.meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.meta .date-time {
    font-size: 12px;
    font-weight: 500;
    color: #4B5563; /* Slightly darker grey for date */
    margin-bottom: 4px;
}

.meta .name {
  font-weight: 700; /* Bolder title */
  font-size: 16px; /* Larger title font */
  color: #111827;
}

.meta .organizer {
  font-size: 14px; /* Larger organizer font */
  color: #6b7280;
  margin-top: 2px;
}

.empty {
  padding: 12px;
  text-align: center;
  color: #6b7280;
}

/* --- LOADING STYLES --- */

.loading-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3B82F6; 
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>