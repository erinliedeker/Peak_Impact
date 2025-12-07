<template>
  <div class="event-card">
    <div class="organizer-info">
      <img class="organizer-avatar" 
      :src="item.organizer.avatar || defaultAvatar" 
      :alt="`Avatar for ${item.organizer.name}`"  
      />
      <a class="organizer-name" href="">{{ item.organizer.name }}</a>
    </div>
    <header class="event-header">
      <h1>{{ item.name }}</h1>
    </header>
    <div class="action-buttons">
      <button class="btn primary">RSVP</button>
      <button class="btn secondary">Share</button>
    </div>
    <div class="details">
      <h2>Event Details</h2>
      <p><strong>Date:</strong> {{ new Date(item.date).toLocaleDateString() }}</p>
      <p><strong>Location:</strong> {{ item.location }}</p>
      <p><strong>Category:</strong> {{ item.category }}</p>
      <p><strong>Status:</strong> {{ item.status }}</p>
      <h2>Description</h2>
      <p v-if="item.description">{{ item.description }}</p>
      <p v-else>No description available.</p>
    </div>
    <div class="organizer-details">
      <h2>About {{ item.organizer.name }}</h2>
      <p v-if="item.organizer.description">{{ item.organizer.description }}</p>
      <p v-else>No organizer description available.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } })
</script>

<style scoped>

.event-card { 
  display: flex;
  flex-direction: column;
  flex-grow: 3;
  align-items: left;
  padding: 2rem 5rem; 
  background: #fff; 
  border-radius: 8px; 
}

.organizer-info {
  display: flex;
  flex-direction: row;
  align-items: center;

}

.organizer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.event-header {
  margin-top: 1rem;
  border-bottom: var(--color-border) 1px solid;

}

.action-buttons {
  flex-direction: row;
  padding: .5rem 1rem;
  justify-content: center;
  border-bottom: var(--color-border) 1px solid;

}

.btn{
  padding: 8px 16px;
  border-radius: 6px;
  margin-right: 8px;
  border: 1px solid var(--color-border);
  cursor: pointer;
}
.btn.primary {
  background-color: var(--color-secondary);
  color: var(--color-white);
  border: 1px solid var(--color-border);
}
.btn.primary:hover {
  background-color: var(--color-secondary-dark);
}
</style>