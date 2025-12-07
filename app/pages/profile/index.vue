<template>
  <div class="profile-page">
    
    <div class="profile-grid">
      <div class="col-left">
        <UserProfileCard :communityInfo="cardCommunityInfo" />
        
        <div class="settings-card">
          <h3>Settings</h3>
          <ul class="settings-list">
            <li>Notifications</li>
            <li>Password & Security</li>
            <li>Privacy</li>
            <li class="danger">Delete Account</li>
          </ul>
        </div>
      </div>

      <div class="col-right">
        <ImpactSummary />
        
        <div class="orgs-section">
          <div class="section-header">
            <h3>My Organizations</h3>
            <NuxtLink to="/organizations" class="browse-link">Browse More</NuxtLink>
          </div>

          <div v-if="myOrgs.length === 0" class="empty-state">
            <p>You aren't following any organizations yet.</p>
            <NuxtLink to="/organizations" class="btn-small">Find an Organization</NuxtLink>
          </div>

          <div v-else class="org-list">
            <div v-for="org in myOrgs" :key="org.id" class="org-item">
              <div class="org-avatar-small" :class="org.type.toLowerCase()">
                {{ org.name.substring(0,2) }}
              </div>
              
              <div class="org-info">
                <span class="org-name">{{ org.name }}</span>
                <span class="org-type">{{ formatType(org.type) }}</span>
              </div>

              <NuxtLink :to="`/organizations/${org.id}`" class="view-btn">
                View
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="orgs-section">
          <div class="section-header">
            <h3>My Groups</h3>
            <NuxtLink to="/groups" class="browse-link">Browse All</NuxtLink>
          </div>

          <div v-if="myGroups.length === 0" class="empty-state">
            <p>You haven't joined any groups yet.</p>
            <NuxtLink to="/network#groups" class="btn-small">Join a Group</NuxtLink>
          </div>

          <div v-else class="org-list">
            <div v-for="group in myGroups" :key="group.id" class="org-item">
              <div class="org-avatar-small" :class="group.type.toLowerCase()">
                {{ getGroupInitials(group.name) }} 
              </div>
              
              <div class="org-info">
                <span class="org-name">{{ group.name }}</span>
                <span class="org-type">{{ formatType(group.type) }}</span> 
              </div>

              <NuxtLink :to="`/groups/${group.id}`" class="view-btn">
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
import { computed, onMounted } from 'vue';
import { useOrgStore } from '../stores/orgs';
// 🎯 NEW: Import the Groups Store
import { useGroupsStore } from '../stores/groups'; 
// 🎯 NEW: Import the Auth Store to get the list of joined IDs
import { useAuthStore } from '../stores/auth';

// Initialize Stores
const orgStore = useOrgStore();
// 🎯 NEW: Initialize Groups Store and Auth Store
const groupsStore = useGroupsStore();
const authStore = useAuthStore();


// --- Data Fetching ---

onMounted(() => {
  // 1. Fetch Organizations
  if (orgStore.allOrganizations.length === 0) {
    orgStore.fetchOrganizations();
  }
  // 🎯 2. Fetch Groups (If needed, check if allNeighborhoodGroups is empty)
  if (groupsStore.allNeighborhoodGroups.length === 0) {
    groupsStore.fetchNeighborhoodGroups();
  }
});


// --- Computed Properties ---

// 1. Existing: Followed Organizations
const myOrgs = computed(() => orgStore.followedOrgsList);

// 🎯 NEW: Joined Groups
const myGroups = computed(() => {
  // Get the list of IDs from the User's profile
  const joinedGroupIds = authStore.profile?.joinedGroups || [];
  
  // Filter the groups store's master list
  return groupsStore.allNeighborhoodGroups.filter(group => 
    joinedGroupIds.includes(String(group.id))
  );
});

const cardCommunityInfo = computed(() => {
    // 1. Prioritize a Group
    if (myGroups.value.length > 0) {
        const group = myGroups.value[0];
        return {
            name: group.name,
            link: `/groups/${group.id}`,
            label: 'Group',
            exists: true
        };
    }
    
    // 2. Fallback to an Organization (Optional)
    if (myOrgs.value.length > 0) {
        const org = myOrgs.value[0];
        return {
            name: org.name,
            link: `/organizations/${org.id}`,
            label: formatType(org.type),
            exists: true
        };
    }

    // 3. Fallback message (Replaces "No Neighborhood Selected")
    return {
        name: 'Join a Group',
        link: '/groups',
        label: 'Community Focus',
        exists: false
    };
});


// --- Helper Functions ---

const formatType = (type) => type.replace(/([A-Z])/g, ' $1').trim();

// 🎯 NEW: Helper for Group Initials (Reusing the logic from before)
function getGroupInitials(name) {
    if (!name) return '??';
    return name
        .split(/\s+/)
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0,2); // Keep it to 2 characters for the small avatar
}
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.col-left, .col-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Settings Card (Left) */
.settings-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.5rem;
}

.settings-list {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.settings-list li {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-main);
  cursor: pointer;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.settings-list li:hover {
  color: var(--color-primary);
}

.settings-list li:last-child {
  border-bottom: none;
}

.settings-list li.danger {
  color: #E53E3E;
}

/* NEW: Organizations Section (Right) */
.orgs-section {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text-main);
}

.browse-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary);
}

.empty-state {
  text-align: center;
  color: var(--color-text-sub);
  padding: 1rem;
}

.btn-small {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent);
}

/* Org List Items */
.org-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.org-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: background 0.2s;
}

.org-item:hover {
  background-color: var(--color-bg);
}

.org-avatar-small {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background-color: #cbd5e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--color-text-main);
  margin-right: 1rem;
  font-size: 0.9rem;
}

/* Color code avatars */
.org-avatar-small.nonprofit { background-color: #C6F6D5; color: #22543d; }
.org-avatar-small.citydept { background-color: #BEE3F8; color: #2a4365; }
.org-avatar-small.neighborhoodgroup { background-color: #FEEBC8; color: #744210; }

.org-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.org-name {
  font-weight: 700;
  color: var(--color-text-main);
  font-size: 0.95rem;
}

.org-type {
  font-size: 0.75rem;
  color: var(--color-text-sub);
  text-transform: uppercase;
}

.view-btn {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-sub);
  padding: 6px 12px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.view-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>