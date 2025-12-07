<template>
  <div class="event-list" role="list" aria-label="Event list">
    <div v-if="events.length === 0" class="empty">No events match the current filters.</div>

    <ul v-else class="list" role="list">
      <li
        v-for="event in events"
        :key="event.id"
        class="event-item"
        role="listitem"
        @click="$emit('select', event)"
      >
        <img
          class="avatar"
          :src="event.organizer?.avatar || defaultAvatar"
          :alt="`Avatar for ${event.organizer?.name || 'organizer'}`"
        />

        <div class="meta">
          <div class="name">{{ event.name }}</div>
          <div class="organizer">By {{ event.organizer?.name || 'Unknown' }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  events: { type: Array, default: () => [] },
  defaultAvatar: { type: String, default: '/assets/avatar-placeholder.png' }
})
</script>

<style scoped>
.event-list {
  max-height: 360px;
  overflow-y: auto;
  padding: 6px;
  display: block;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background .12s ease;
}

.event-item:hover { background: rgba(142, 137, 137, 0.03); }

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
  flex-shrink: 0;
}

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