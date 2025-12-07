<template>
  <div class="org-detail-page">
    
    <div v-if="loading" class="state-msg">Loading organization...</div>
    <div v-else-if="!org" class="state-msg">Organization not found.</div>

    <div v-else>
      <header class="org-header">
        <div class="banner" :class="org.type.toLowerCase()"></div>
        
        <div class="header-content">
          <div class="header-main">
            <div class="org-avatar-large">
              {{ org.name.substring(0, 2) }}
            </div>

            <div class="info-block">
              <div class="title-row">
                <h1 class="org-name">{{ org.name }}</h1>
                <span class="org-badge">{{ formatType(org.type) }}</span>
              </div>
              
              <div class="action-row">
                <button 
                  class="follow-btn" 
                  :class="{ active: isFollowing }"
                  @click="toggleFollow"
                >
                  <Icon v-if="isFollowing" name="heroicons:check" />
                  <Icon v-else name="heroicons:plus" />
                  {{ isFollowing ? 'Following' : 'Follow' }}
                </button>
                <button class="contact-btn">
                  <Icon name="heroicons:envelope" /> Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="stats-bar">
        <div class="stat">
          <span class="val">{{ orgEvents.length }}</span>
          <span class="label">Events Posted</span>
        </div>
        <div class="stat">
          <span class="val">1.2k</span> <span class="label">Followers</span>
        </div>
        <div class="stat">
          <span class="val">4.9</span>
          <span class="label">Rating</span>
        </div>
      </div>

      <div class="page-tabs">
        <button 
          class="tab" 
          :class="{ active: activeTab === 'about' }"
          @click="activeTab = 'about'"
        >
          About
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'events' }"
          @click="activeTab = 'events'"
        >
          Upcoming Events ({{ orgEvents.length }})
        </button>
      </div>

      <div class="tab-content">
        
        <div v-if="activeTab === 'about'" class="about-section">
          <div class="content-card">
            <h3>Who We Are</h3>
            <p class="description">{{ org.description }}</p>
            
            <div class="contact-grid">
              <div class="contact-item">
                <Icon name="heroicons:envelope-solid" class="c-icon" />
                <span>{{ org.contactEmail }}</span>
              </div>
              <div v-if="org.socialLinks.facebook" class="contact-item">
                <Icon name="heroicons:user-group-solid" class="c-icon" />
                <span>{{ org.socialLinks.facebook }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'events'" class="events-section">
          
          <div v-if="orgEvents.length === 0" class="empty-events">
            <p>This organization has no active events right now.</p>
          </div>

          <div v-else class="event-grid">
            <div v-for="event in orgEvents" :key="event.id" class="event-card-row">
              <div class="date-box">
                <span class="month">{{ getMonth(event.date) }}</span>
                <span class="day">{{ getDay(event.date) }}</span>
              </div>
              
              <div class="event-info">
                <h4>{{ event.title }}</h4>
                <div class="meta">
                  <span><Icon name="heroicons:clock" class="tiny-icon"/> {{ event.time }}</span>
                  <span><Icon name="heroicons:map-pin" class="tiny-icon"/> {{ event.location.lat.toFixed(2) }}...</span>
                </div>
                <div class="tags">
                   <span class="pill">{{ event.category }}</span>
                   <span v-if="event.isMicroProject" class="pill micro">Micro</span>
                </div>
              </div>

              <NuxtLink :to="`/events/${event.id}`" class="view-event-btn">
                View
              </NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useOrgStore } from '../stores/orgs';
import { useEventsStore } from '../stores/events';

const route = useRoute();
const orgStore = useOrgStore();
const eventsStore = useEventsStore();

const activeTab = ref('about');
const loading = ref(true);

// Get Org ID from URL
const orgId = parseInt(route.params.id);

// Computed: Find the specific org
const org = computed(() => {
  return orgStore.allOrganizations.find(o => o.id === orgId);
});

// Computed: Filter events for this org
const orgEvents = computed(() => {
  return eventsStore.allEvents.filter(e => e.organizationId === orgId);
});

// Computed: Check follow status
const isFollowing = computed(() => {
  return orgStore.followedOrganizations.includes(orgId);
});

// Logic
const toggleFollow = () => {
  orgStore.toggleFollowOrg(orgId);
};

onMounted(async () => {
  // Ensure data is loaded
  if (orgStore.allOrganizations.length === 0) await orgStore.fetchOrganizations();
  if (eventsStore.allEvents.length === 0) await eventsStore.fetchEvents();
  loading.value = false;
});

// Helpers
const formatType = (type) => type.replace(/([A-Z])/g, ' $1').trim();
const getMonth = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short' });
const getDay = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric' });
</script>

<style scoped>
.org-detail-page {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  min-height: 80vh;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
}

/* --- HEADER & BANNER --- */
.banner {
  height: 160px; /* Taller banner looks better */
  background-color: #cbd5e0;
}
.banner.nonprofit { background-color: var(--color-secondary); }
.banner.citydept { background-color: var(--color-primary); }
.banner.neighborhoodgroup { background-color: var(--color-accent); }

.header-content {
  padding: 0 2rem;
  margin-bottom: 2rem;
}

.header-main {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start; /* Aligns items to top so text pushes down correctly */
  margin-top: -50px; /* Pulls the Avatar UP into the banner */
}

.org-avatar-large {
  width: 120px;
  height: 120px;
  background: white;
  border: 4px solid white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-main);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  flex-shrink: 0; /* Prevents avatar from getting squished */
  z-index: 2;
}

.info-block {
  flex-grow: 1;
  /* CRITICAL FIX: Pushes the text down so it sits on the white background */
  padding-top: 60px; 
}

.title-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 1rem;
}

.org-name {
  font-size: 2rem;
  color: var(--color-text-main);
  margin: 0;
  line-height: 1.1;
  font-weight: 800;
}

/* FIXED BADGE STYLE */
.org-badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-text-sub);
  background-color: #f1f5f9; /* Light grey pill background */
  padding: 4px 12px;
  border-radius: 99px;
  font-weight: 700;
  border: 1px solid var(--color-border);
  letter-spacing: 0.05em;
}

.action-row {
  display: flex;
  gap: 10px;
}

.follow-btn, .contact-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.follow-btn {
  background: var(--color-primary);
  color: white;
}

.follow-btn:hover {
  background: #1e3a8a; /* Darker blue */
}

.follow-btn.active {
  background: var(--color-bg);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.contact-btn {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
}

.contact-btn:hover {
  background-color: #f8fafc;
}

/* --- STATS BAR --- */
.stats-bar {
  display: flex;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem 2rem;
  gap: 4rem;
  background: #f8fafc;
}

.stat {
  display: flex;
  flex-direction: column;
}

.val {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text-main);
}

.label {
  font-size: 0.75rem;
  color: var(--color-text-sub);
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 4px;
}

/* --- TABS --- */
.page-tabs {
  display: flex;
  padding: 0 2rem;
  margin-top: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-sub);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: color 0.2s;
}

.tab:hover {
  color: var(--color-primary);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* --- CONTENT --- */
.tab-content {
  padding: 2rem;
  min-height: 300px;
}

.content-card h3 {
  margin-top: 0;
  color: var(--color-text-main);
}

.description {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--color-text-main);
  margin-bottom: 2rem;
  max-width: 700px;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  background-color: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-sub);
  font-weight: 500;
}

.c-icon {
  font-size: 1.5rem;
  color: var(--color-primary);
}

/* --- EVENT LIST STYLING --- */
.event-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card-row {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
}

.event-card-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 65px;
  height: 65px;
  background: var(--color-bg);
  border-radius: 12px;
  margin-right: 1.5rem;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
}

.month { font-size: 0.75rem; text-transform: uppercase; font-weight: 800; }
.day { font-size: 1.5rem; font-weight: 800; line-height: 1; }

.event-info {
  flex-grow: 1;
}

.event-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-main);
  font-size: 1.1rem;
}

.meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: var(--color-text-sub);
  margin-bottom: 0.75rem;
}

.tiny-icon {
  font-size: 1rem;
  margin-right: 6px;
  vertical-align: text-bottom;
}

.tags {
  display: flex;
  align-items: center;
}

.pill {
  font-size: 0.75rem;
  background: #EBF8FF;
  color: var(--color-primary);
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  margin-right: 8px;
}

.pill.micro {
  background: #FEFCBF;
  color: #744210;
}

.view-event-btn {
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text-sub);
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.view-event-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.empty-events {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-sub);
  font-style: italic;
}

/* Loading/Error States */
.state-msg {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: var(--color-text-sub);
}
</style>