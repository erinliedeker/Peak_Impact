<template>
  <div class="event-list" role="list" aria-label="Conversations list">
    <div v-if="conversations.length === 0" class="empty">No conversations yet.</div>

    <ul v-else class="list" role="list">
      <li
        v-for="conv in conversations"
        :key="conv.id"
        class="event-item"
        role="listitem"
        @click="$emit('select', conv)"
      >
        <img
          class="avatar"
          src='~/assets/images/avatar-placeholder.png'
          :alt="`Avatar for ${conv.user?.name || 'user'}`"
        />

        <div class="meta">
          <div class="name">{{ conv.user?.name || 'Unknown' }}</div>
          <div class="organizer">
            <span class="sender">{{ conv.lastMessage?.senderName || '—' }}</span>
            <span class="sep">:</span>
            <span class="preview">{{ conv.lastMessage?.text || 'No messages yet' }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  conversations: { type: Array, default: () => [] },
  defaultAvatar: { type: String, default: '/assets/avatar-placeholder.png' }
})

defineEmits(['select'])
</script>

<style scoped>
/* Reuse EventList visual styling so this component looks identical */
.event-list {
  height: 100%;
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
  min-height: 5rem;
  width: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background .12s ease;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  box-sizing: border-box;
  gap: 12px;
  padding: 8px 12px;
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

/* second-line shows sender + preview, visually same as organizer in EventList */
.meta .organizer {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.meta .organizer .sender {
  font-weight: 600;
  color: #374151;
}

.meta .organizer .preview {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #6b7280;
}

.empty {
  padding: 12px;
  text-align: center;
  color: #6b7280;
}
</style>