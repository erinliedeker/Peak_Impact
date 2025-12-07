<template>
  <div class="org-card">
    <div class="card-banner" :class="org.type.toLowerCase()"></div>
    
    <div class="card-content">
      <div class="org-avatar">
        {{ getInitials(org.name) }}
      </div>

      <h3 class="org-name">{{ org.name }}</h3>
      <span class="org-type">{{ formatType(org.type) }}</span>
      
      <p class="org-desc">{{ org.description }}</p>

      <div class="org-meta">
        <span v-if="org.socialLinks.instagram">📸 Instagram</span>
        <span v-if="org.socialLinks.facebook">📘 Facebook</span>
      </div>

      <button 
        class="follow-btn" 
        :class="{ active: isFollowing }"
        @click.stop="toggleFollow"
      >
        {{ isFollowing ? 'Following' : 'Follow' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useOrgStore } from '../stores/orgs';

const props = defineProps({
  org: {
    type: Object,
    required: true
  }
});

const orgStore = useOrgStore();

// Computed property to check if THIS org is in the user's follow list
const isFollowing = computed(() => {
  return orgStore.followedOrganizations.includes(props.org.id);
});

const toggleFollow = () => {
  orgStore.toggleFollowOrg(props.org.id);
};

// Helpers
const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0,2);
const formatType = (type) => type.replace(/([A-Z])/g, ' $1').trim(); // "CityDept" -> "City Dept"
</script>

<style scoped>
.org-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.org-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-banner {
  height: 60px;
  background-color: #cbd5e0;
}
/* Color code banners by type */
.card-banner.nonprofit { background-color: var(--color-secondary); } /* Green */
.card-banner.citydept { background-color: var(--color-primary); }    /* Blue */
.card-banner.neighborhoodgroup { background-color: var(--color-accent); } /* Orange */

.card-content {
  padding: 1.5rem;
  padding-top: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.org-avatar {
  width: 64px;
  height: 64px;
  background: white;
  border: 4px solid white;
  border-radius: 12px;
  margin-top: -32px; /* Pull up into banner */
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: var(--color-text-main);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 1.2rem;
}

.org-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.25rem;
}

.org-type {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-text-sub);
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.org-desc {
  font-size: 0.9rem;
  color: var(--color-text-sub);
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.org-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.8rem;
  color: var(--color-text-sub);
}

.follow-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-primary);
  background: white;
  color: var(--color-primary);
}

.follow-btn:hover {
  background: #ebf8ff;
}

.follow-btn.active {
  background: var(--color-primary);
  color: white;
}
</style>