<template>
  <div class="org-card">
    <div class="card-banner" :class="org.type.toLowerCase()"></div>

    <div class="card-content">
      
      <div v-if="matchScore > 0" class="score-badge" :class="scoreClass">
        <Icon name="heroicons:fire-solid" size="0.9rem" />
        {{ matchScore }}% Match
      </div>
      <NuxtLink :to="`/organizations/${org.id}`" class="org-avatar">
        {{ getInitials(org.name) }}
      </NuxtLink>

      <NuxtLink :to="`/organizations/${org.id}`" class="name-link">
        <h3 class="org-name">{{ org.name }}</h3>
      </NuxtLink>

      <span class="org-type">{{ formatType(org.type) }}</span>

      <p class="org-desc">{{ org.description }}</p>

      <div class="org-meta">
        <span v-if="org.socialLinks.instagram">📸 Instagram</span>
        <span v-if="org.socialLinks.facebook">📘 Facebook</span>
      </div>

      <div class="button-group">
        <button class="icon-btn instagram-btn" @click.stop="openInstagram" title="Open Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </button>

        <button class="icon-btn google-btn" @click.stop="openWebSearch" title="Search on Google">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
        </button>

        <button v-if="!org.propublica" class="follow-btn" :class="{ active: isFollowing }" @click.stop="toggleFollow">
          {{ isFollowing ? 'Following' : 'Follow' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOrgStore } from '../stores/orgs';
import { computed } from 'vue';

const props = defineProps({
  org: { type: Object, required: true },
  matchScore: { type: Number, required: true, default: 0 }
});

const orgStore = useOrgStore();

// 🌟 NEW: Determine Color based on Score 🌟
const scoreClass = computed(() => {
  if (props.matchScore >= 75) return 'high-match';   // Green
  if (props.matchScore >= 40) return 'medium-match'; // Orange
  return 'low-match';                                // Gray/Blue
});

const isFollowing = computed(() => orgStore.followedOrganizations.includes(props.org.id));
const toggleFollow = () => orgStore.toggleFollowOrg(props.org.id);

const openInstagram = () => {
  if (props.org.socialLinks && props.org.socialLinks.instagram) {
    window.open(props.org.socialLinks.instagram, '_blank');
  } else {
    const nameEncoded = encodeURIComponent(props.org.name + " Colorado Springs");
    const searchUrl = `https://www.google.com/search?q=site:instagram.com+"${nameEncoded}"`;
    window.open(searchUrl, '_blank');
  }
};

const openWebSearch = () => {
  const nameEncoded = encodeURIComponent(props.org.name + " Colorado Springs");
  const searchUrl = `https://www.google.com/search?q=${nameEncoded}`;
  window.open(searchUrl, '_blank');
};

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0,2);
const formatType = (type) => type.replace(/([A-Z])/g, ' $1').trim();
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

.card-banner.nonprofit {
  background-color: var(--color-secondary);
}

.card-banner.citydept {
  background-color: var(--color-primary);
}

.card-banner.neighborhoodgroup {
  background-color: var(--color-accent);
}

.score-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: white; /* Text is always white */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Color Variants */
.high-match {
  background-color: #38a169; /* Green for > 75% */
}

.medium-match {
  background-color: #dd6b20; /* Orange for 40% - 74% */
}

.low-match {
  background-color: #718096; /* Gray for < 40% */
}

.score-badge .icon {
  font-size: 1rem;
  line-height: 1;
}


.card-content {
  padding: 1.5rem;
  padding-top: 0;
  position: relative; /* Essential for positioning the score-badge */
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

/* Updated Avatar Style to be clickable */
.org-avatar {
  width: 64px;
  height: 64px;
  background: white;
  border: 4px solid white;
  border-radius: 12px;
  margin-top: -32px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: var(--color-text-main);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 1.2rem;
  text-decoration: none;
  /* Removes link underline */
  transition: opacity 0.2s;
}

.org-avatar:hover {
  opacity: 0.9;
}

/* Updated Name Link Style */
.name-link {
  text-decoration: none;
}

.org-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.25rem;
  transition: color 0.2s;
}

/* Hover effect on name */
.name-link:hover .org-name {
  color: var(--color-primary);
  text-decoration: underline;
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

.button-group {
  display: flex;
  gap: 8px; /* Space between buttons */
  margin-top: auto; 
}

/* Base style for the new icon buttons */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px; /* Fixed square size */
  height: 42px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-sub);
}

.icon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

/* Instagram specific hover colors */
.instagram-btn:hover {
  color: #C13584; /* Instagram Brand Color */
  border-color: #C13584;
  background: #fdf2f8;
}

/* Google specific hover colors */
.google-btn:hover {
  color: #4285F4; /* Google Blue */
  border-color: #4285F4;
  background: #eff6ff;
}

/* The Follow button takes up remaining space */
.follow-btn {
  flex-grow: 1;
  padding: 0 16px; /* Horizontal padding only */
  height: 42px; /* Match height of icon buttons */
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-primary);
  background: white;
  color: var(--color-primary);
  /* distinct from icon buttons */
}

.follow-btn:hover {
  background: #ebf8ff;
}

.follow-btn.active {
  background: var(--color-primary);
  color: white;
}
</style>