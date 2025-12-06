<template>
  <div class="event-detail-page">
    
    <div v-if="loading" class="state-msg">Loading details...</div>
    <div v-else-if="!event" class="state-msg">Event not found.</div>

    <div v-else>
      <div class="back-link">
        <NuxtLink to="/">← Back to Map</NuxtLink>
      </div>

      <div class="header-section">
        <span class="category-badge">{{ event.category }}</span>
        <h1 class="title">{{ event.title }}</h1>
        <p class="org">Hosted by <strong>{{ event.organizationName }}</strong></p>
      </div>

      <div class="grid-layout">
        <div class="details-col">
          <img src="https://placehold.co/600x300?text=Event+Image" alt="Event Banner" class="banner-img" />
          
          <div class="info-block">
            <h3>About this Opportunity</h3>
            <p>{{ event.description }}</p>
          </div>

          <div class="info-block">
            <h3>Supplies Needed</h3>
            <ul class="supplies-list">
              <li v-for="item in event.suppliesNeeded" :key="item">
                🔧 {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <div class="action-col">
          <div class="action-card">
            <div class="time-loc">
              <div class="row">
                <span class="icon">🗓️</span>
                <div>
                  <strong>{{ formatDate(event.date) }}</strong>
                  <div class="sub">{{ event.time }}</div>
                </div>
              </div>
              <div class="row">
                <span class="icon">📍</span>
                <div>
                  <strong>Location</strong>
                  <div class="sub">Lat: {{ event.location.lat }}, Lng: {{ event.location.lng }}</div>
                </div>
              </div>
            </div>

            <div class="stats">
              <div class="stat-item">
                <span class="big">{{ event.volunteersSignedUp }}</span>
                <span class="label">Signed Up</span>
              </div>
              <div class="stat-item">
                <span class="big">{{ event.volunteersNeeded }}</span>
                <span class="label">Needed</span>
              </div>
            </div>

            <button class="signup-btn" @click="handleSignup">
              Volunteer Now
            </button>
            <p class="impact-note">+ Earn {{ event.isMicroProject ? '5' : '20' }} Impact Points</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEventsStore } from '~/stores/events';

const route = useRoute();
const eventsStore = useEventsStore();

// 1. Get the ID from the URL (e.g., "1")
const eventId = parseInt(route.params.id);

// 2. Find the event in the store
// (In a real app, you might fetch this individual ID from an API)
const event = computed(() => {
  return eventsStore.allEvents.find(e => e.id === eventId);
});

// 3. Simple helpers
const loading = ref(false); // Mock loading state

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });
};

const handleSignup = () => {
  alert(`You signed up for ${event.value.title}!`);
};
</script>

<style scoped>
.event-detail-page {
  max-width: 1000px;
  margin: 0 auto;
}

.back-link a {
  text-decoration: none;
  color: #718096;
  font-weight: 600;
  margin-bottom: 1rem;
  display: inline-block;
}

.header-section {
  margin-bottom: 2rem;
}

.category-badge {
  background: #ebf8ff;
  color: #2b6cb0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.title {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.grid-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.banner-img {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.info-block {
  margin-bottom: 2rem;
}

.info-block h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.supplies-list {
  list-style: none;
  padding: 0;
}

.supplies-list li {
  background: #f7fafc;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 6px;
  display: inline-block;
  margin-right: 8px;
  border: 1px solid #e2e8f0;
}

.action-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  position: sticky;
  top: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.time-loc {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #edf2f7;
}

.row {
  display: flex;
  gap: 12px;
  margin-bottom: 1rem;
}

.icon {
  font-size: 1.5rem;
}

.sub {
  color: #718096;
  font-size: 0.9rem;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
  text-align: center;
}

.big {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: #2b6cb0;
}

.label {
  font-size: 0.8rem;
  color: #718096;
  text-transform: uppercase;
}

.signup-btn {
  width: 100%;
  background: #2b6cb0;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.signup-btn:hover {
  background: #2c5282;
}

.impact-note {
  text-align: center;
  font-size: 0.85rem;
  color: #48bb78;
  margin-top: 0.75rem;
  font-weight: 600;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}
</style>