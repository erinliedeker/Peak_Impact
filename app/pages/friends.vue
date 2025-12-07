<template>
  <div class="friends-page">
    <div class="page-header">
      <h1>My Connections</h1>
      <p>People you're connected with on Peak Impact</p>
    </div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'requests' }" @click="activeTab = 'requests'">
        Requests <span class="count">{{ pendingRequests.length }}</span>
      </button>
      <button :class="{ active: activeTab === 'followers' }" @click="activeTab = 'followers'">
        Followers <span class="count">{{ followers.length }}</span>
      </button>
      <button :class="{ active: activeTab === 'following' }" @click="activeTab = 'following'">
        Following <span class="count">{{ following.length }}</span>
      </button>
    </div>

    <div class="search-box">
      <Icon name="heroicons:magnifying-glass" size="1.2rem" class="text-gray-400" />
      <input
        type="text"
        placeholder="Search connections..."
        v-model="searchQuery"
      />
    </div>

    <div v-if="isLoading" class="loading-state">
      <Icon name="heroicons:arrow-path" class="spinner" size="2rem" />
      <p>Loading connections...</p>
    </div>

    <div v-else class="friends-list">
      <div v-if="filteredList.length === 0" class="empty-state">
        <Icon name="heroicons:users" size="3rem" class="empty-icon" />
        <h3 v-if="activeTab === 'requests'">No pending requests</h3>
        <h3 v-else-if="activeTab === 'followers'">No followers yet</h3>
        <h3 v-else>Not following anyone yet</h3>
        
        <p v-if="activeTab === 'requests'">Follow requests will appear here.</p>
        <p v-else-if="activeTab === 'followers'">When people follow you, they'll appear here.</p>
        <p v-else>Start following people in your community!</p>
        <NuxtLink to="/network" class="btn-primary">Find People</NuxtLink>
      </div>

      <div v-for="person in filteredList" :key="person.id" class="friend-item">
        <NuxtLink :to="`/volunteers/${person.id}`" class="friend-link">
          <div class="avatar-lg">{{ person.initials }}</div>
          <div class="friend-info">
            <h3>{{ person.name }}</h3>
            <p class="user-type">{{ person.userType || 'Volunteer' }}</p>
            <p class="impact">
              <Icon name="heroicons:sparkles" size="0.9rem" />
              {{ person.impactPoints }} Impact Points
            </p>
          </div>
        </NuxtLink>
        <div class="friend-actions">
          <template v-if="activeTab === 'requests' && person.requestId">
            <button @click="acceptRequest(person.requestId)" class="btn-action btn-accept">
              <Icon name="heroicons:check" size="1rem" />
              Accept
            </button>
            <button @click="rejectRequest(person.requestId)" class="btn-action btn-reject">
              <Icon name="heroicons:x-mark" size="1rem" />
              Decline
            </button>
          </template>
          <NuxtLink v-else :to="`/volunteers/${person.id}`" class="btn-action btn-view">
            <Icon name="heroicons:eye" size="1rem" />
            View Profile
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { useAuthStore } from '~~/stores/auth';
import { useFriendRequests } from '~~/composables/useFriendRequests';

interface Friend {
  id: string;
  name: string;
  initials: string;
  impactPoints: number;
  userType?: string;
  requestId?: string; // For pending requests
}

const authStore = useAuthStore();
const friendRequests = useFriendRequests();

const activeTab = ref<'requests' | 'followers' | 'following'>('requests');
const searchQuery = ref('');
const isLoading = ref(true);

const pendingRequests = ref<Friend[]>([]);
const followers = ref<Friend[]>([]);
const following = ref<Friend[]>([]);

const filteredList = computed(() => {
  let list: Friend[] = [];
  
  switch (activeTab.value) {
    case 'requests':
      list = pendingRequests.value;
      break;
    case 'followers':
      list = followers.value;
      break;
    case 'following':
      list = following.value;
      break;
  }

  if (!searchQuery.value) return list;
  
  const q = searchQuery.value.toLowerCase();
  return list.filter(p => p.name.toLowerCase().includes(q));
});

onMounted(async () => {
  await loadConnections();
});

async function loadConnections() {
  if (!authStore.profile?.id) return;
  
  isLoading.value = true;
  try {
    const userId = authStore.profile.id;

    // Use the composable functions which already include pending requests
    const followerIds = await friendRequests.getFollowers(userId);
    const followingIds = await friendRequests.getFollowing(userId);

    // Load follower details
    const db = getFirestore();
    const followersList: Friend[] = [];
    for (const followerId of followerIds) {
      const userDoc = await getDoc(doc(db, 'users', followerId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        followersList.push({
          id: followerId,
          name: userData.name || 'User',
          initials: getInitials(userData.name || 'U'),
          impactPoints: userData.impactPoints || 0,
          userType: userData.userType
        });
      }
    }
    followers.value = followersList;

    // Load following details
    const followingList: Friend[] = [];
    for (const followingId of followingIds) {
      const userDoc = await getDoc(doc(db, 'users', followingId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        followingList.push({
          id: followingId,
          name: userData.name || 'User',
          initials: getInitials(userData.name || 'U'),
          impactPoints: userData.impactPoints || 0,
          userType: userData.userType
        });
      }
    }
    following.value = followingList;

    // Load pending requests
    const requestsQuery = query(
      collection(db, 'friendRequests'),
      where('to', '==', userId),
      where('status', '==', 'pending')
    );
    const requestsSnap = await getDocs(requestsQuery);
    
    const requestsList: Friend[] = [];
    for (const docSnap of requestsSnap.docs) {
      const fromUserId = docSnap.data().from;
      const userDoc = await getDoc(doc(db, 'users', fromUserId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        requestsList.push({
          id: fromUserId,
          requestId: docSnap.id,
          name: userData.name || 'User',
          initials: getInitials(userData.name || 'U'),
          impactPoints: userData.impactPoints || 0,
          userType: userData.userType
        });
      }
    }
    pendingRequests.value = requestsList;

  } catch (e) {
    console.error('Failed to load connections', e);
  } finally {
    isLoading.value = false;
  }
}

async function acceptRequest(requestId: string) {
  try {
    await friendRequests.acceptFollowRequest(requestId);
    await loadConnections(); // Reload to update counts
  } catch (e) {
    console.error('Failed to accept request', e);
    alert('Failed to accept request');
  }
}

async function rejectRequest(requestId: string) {
  try {
    await friendRequests.rejectFollowRequest(requestId);
    await loadConnections(); // Reload to update counts
  } catch (e) {
    console.error('Failed to reject request', e);
    alert('Failed to reject request');
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .toUpperCase();
}
</script>

<style scoped>
.friends-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--color-text-sub);
  font-size: 1rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-border);
}

.tabs button {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-sub);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: -2px;
}

.tabs button:hover {
  color: var(--color-primary);
}

.tabs button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.count {
  background: var(--color-bg);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
}

.tabs button.active .count {
  background: var(--color-primary);
  color: white;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-sub);
}

.spinner {
  animation: spin 1s linear infinite;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-sub);
}

.empty-icon {
  color: var(--color-border);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.btn-primary {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  transition: 0.2s;
}

.friend-item:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.friend-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.avatar-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.friend-info {
  flex: 1;
}

.friend-info h3 {
  font-size: 1.1rem;
  color: var(--color-text-main);
  margin-bottom: 0.25rem;
}

.user-type {
  font-size: 0.85rem;
  color: var(--color-text-sub);
  margin-bottom: 0.5rem;
}

.impact {
  font-size: 0.9rem;
  color: var(--color-accent);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.friend-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  text-decoration: none;
  border: 1px solid var(--color-border);
  background: white;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-unfriend {
  color: #c53030;
  border-color: #feb2b2;
}

.btn-unfriend:hover:not(:disabled) {
  background: #fff5f5;
}

.btn-view {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-view:hover {
  background: #eff6ff;
}

.btn-accept {
  color: #22c55e;
  border-color: #86efac;
}

.btn-accept:hover:not(:disabled) {
  background: #f0fdf4;
}

.btn-reject {
  color: #ef4444;
  border-color: #fca5a5;
}

.btn-reject:hover:not(:disabled) {
  background: #fef2f2;
}

@media (max-width: 768px) {
  .friend-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .friend-actions {
    width: 100%;
  }

  .btn-action {
    flex: 1;
    justify-content: center;
  }
}
</style>
