<template>
  <div class="event-list" role="list" aria-label="Event list">
    <div v-if="events.length === 0" class="empty">No events match the current filters.</div>

    <ul v-else class="list" role="list">
      <li
        v-for="event in events"
        :key="event.id"
        :class="['event-item', { 'selected': event.id === activeId}]"
        role="listitem"
        @click="$emit('select', event); onClick(event)"
      >
        <div class="avatar" :class="getCategoryClass(event.category)">
          <Icon :name="getCategoryIcon(event.category)" class="category-icon" />
        </div>
        <div class="meta">
          <div class="name">{{ event.title }}</div>
          <div class="organizer">By {{ event.organizationName || 'Unknown' }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
// Assuming you have an Icon component imported here or globally available
// import { Icon } from '#components' // Example import if needed

const props = defineProps({
  events: { type: Array, default: () => [] },
  defaultAvatar: { type: String, default: '/assets/avatar-placeholder.png' }
})

const internalSelected = ref(null)
const activeId = computed(() => internalSelected.value)

function onClick(event) {
  internalSelected.value = event.id
}

// --- Category Icon Logic ---

function getCategoryIcon(category) {
  // Use category names defined in your event structure
  switch (category) {
    case 'Environment': return 'heroicons:tree';
    case 'Social': return 'heroicons:hand-raised';
    case 'PublicSafety': return 'heroicons:shield-check';
    case 'Youth': return 'heroicons:user-group';
    case 'Arts': return 'heroicons:paint-brush';
    // Add more cases as needed for other categories
    default: return 'heroicons:sparkles'; // Default generic icon
  }
}

function getCategoryClass(category) {
    // Converts categories like 'PublicSafety' to 'publicsafety' for CSS matching
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
  min-height: 5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background .12s ease;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  padding: 8px 12px;
  gap: 12px;
  box-sizing: border-box;
}

.event-item.selected {
  background-color: rgba(142, 137, 137, 0.03);
}

.event-item:hover { background: rgba(142, 137, 137, 0.03); }

/* --- ICON STYLING --- */

/* Replaced <img> styles with a container for the icon */
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white; /* Icon color */
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.category-icon {
  width: 24px;
  height: 24px;
}

/* Category-specific colors for the background */
.avatar.environment { background-color: #10B981; } /* Green */
.avatar.social { background-color: #3B82F6; }      /* Blue */
.avatar.publicsafety { background-color: #F59E0B; } /* Orange */
.avatar.youth { background-color: #8B5CF6; }        /* Purple */
.avatar.arts { background-color: #EC4899; }         /* Pink */
.avatar.default { background-color: #6B7280; }      /* Gray fallback */

/* --- END ICON STYLING --- */

.meta .name {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.meta .organizer {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.empty {
  padding: 12px;
  text-align: center;
  color: #6b7280;
}
</style>