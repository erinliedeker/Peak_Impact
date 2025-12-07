<template>
  <div class="network-container">

    <div class="main-feed">
      <div class="feed-header">
        <h1>Network</h1>
        <div class="tabs">
          <button :class="{ active: activeTab === 'friends' }" @click="activeTab = 'friends'">People</button>
          <button :class="{ active: activeTab === 'groups' }" @click="activeTab = 'groups'">Neighborhoods & Groups</button>
        </div>
        <div class="search-box">
          <Icon name="heroicons:magnifying-glass" size="1.2rem" class="text-gray-400" />
          <input
            type="text"
            :placeholder="activeTab === 'friends' ? 'Search people...' : 'Find a neighborhood or group...'"
            v-model="searchQuery"
          />
        </div>
      </div>

      <div v-if="activeTab === 'friends'" class="content-view">

        <div v-if="isLoading" class="section-container">
          <p>Loading people...</p>
        </div>

        <div v-if="!isLoading && filteredFriends.length === 0" class="section-container">
          <p>No people found.</p>
        </div>

        <div class="friends-grid">
          <div v-for="person in filteredFriends" :key="person.id" class="friend-card">
            <div class="card-header-bg"></div>
            <div class="card-content">
              <div class="avatar-lg">{{ person.initials }}</div>
              <h3>{{ person.name }}</h3>

              <div class="streak-pill" v-if="person.userType">
                <Icon name="heroicons:user" size="0.9rem" /> {{ person.userType }}
              </div>

              <div class="badge-row">
                <span class="impact-score">Impact {{ person.impactPoints }}</span>
                <span v-if="person.mutualFriends && person.mutualFriends > 0" class="mutual-badge">
                  <Icon name="heroicons:users" size="0.8rem" /> {{ person.mutualFriends }} mutual
                </span>
              </div>

              <div class="btn-row">
                <button
                  class="btn-profile"
                  :class="{
                    'btn-following': friendStatusMap[person.id] === 'following'
                  }"
                  @click="handleFollowAction(person.id)"
                  :disabled="isActionLoading[person.id]"
                >
                  <Icon 
                    :name="getFollowButtonIcon(person.id)" 
                    size="0.9rem" 
                  />
                  {{ getFollowButtonText(person.id) }}
                </button>
                <NuxtLink :to="`/volunteers/${person.id}`" class="btn-profile">
                  View Profile
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'groups'" class="content-view">
        <div class="groups-grid">
          <NuxtLink
            v-for="group in filteredGroups"
            :key="group.id"
            :to="`/groups/${group.id}`"
            class="group-card"
          >
            <div class="group-banner" :style="{ backgroundColor: group.color }"></div>
            <div class="group-info-block">
              <div class="group-icon">{{ group.initials }}</div>
              <div class="group-text">
                <h2>{{ group.name }}</h2>
                <p>{{ group.memberCount }} Neighbors · {{ group.activeEvents }} Active Events</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

    </div>

    <aside class="side-widgets">
      <div class="widget">
        <div class="widget-header">
          <h3>
            <Icon name="heroicons:chart-bar-solid" size="1.1rem" class="text-orange" />
            Your Circle
          </h3>
          <span class="label">Impact</span>
        </div>
        <div class="leader-list">
          <div v-for="(person, index) in sortedFriends" :key="person.id" class="leader-row">
            <span class="rank" :class="{ 'top-rank': index < 3 }">
              <Icon v-if="index === 0" name="heroicons:trophy-solid" size="1rem" class="text-orange" />
              <span v-else>{{ index + 1 }}</span>
            </span>
            <div class="avatar-xs">{{ person.initials }}</div>
            <div class="leader-name">{{ person.name }}</div>
            <div class="leader-pts">{{ person.impactPoints }}</div>
          </div>
        </div>
      </div>

      <div class="widget invite-widget">
        <div class="widget-header">
          <h3>
            <Icon name="heroicons:envelope-solid" size="1.1rem" class="text-orange" />
            Invite Friends
          </h3>
        </div>
        <p>Grow your impact circle.</p>
        <div class="invite-form" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.5em;">
          <button @click="copyReferralLink" class="btn-profile" style="width: 100%;">
            <Icon name="heroicons:link" size="1rem" style="margin-right: 0.5em;" />
            Copy Invite Link
          </button>
        </div>
      </div>
    </aside>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, type Ref } from 'vue';
import { getFirestore, collection, getDocs, getDoc, doc, query, where, type DocumentData } from 'firebase/firestore';
import { useCollection } from 'vuefire';
import { useAuthStore } from '~~/stores/auth';
import { useFriendRequests } from '~~/composables/useFriendRequests';

const activeTab: Ref<string> = ref('friends');
const searchQuery: Ref<string> = ref('');
const isLoading: Ref<boolean> = ref(false);

const authStore = useAuthStore();

// Referral link logic
const referralLink = computed(() => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const userId = authStore.profile?.id;
  if (!userId) return '';
  return `${baseUrl}/signup?ref=${userId}`;
});

function copyReferralLink() {
  if (!referralLink.value) return;
  navigator.clipboard.writeText(referralLink.value)
    .then(() => {
      alert('Referral link copied!');
    })
    .catch(() => {
      alert('Failed to copy link.');
    });
}

const friendRequests = useFriendRequests();

interface PersonInfo {
  id: string;
  name: string;
  initials: string;
  impactPoints: number;
  userType?: string;
  mutualFriends?: number;
}

// Users fetched from Firestore
const people: Ref<PersonInfo[]> = ref<PersonInfo[]>([]);

// Map of userId -> friend status
type FollowStatus = 'following' | 'requested' | 'not_following';
const friendStatusMap: Ref<Record<string, FollowStatus>> = ref<Record<string, FollowStatus>>({});

// Map of userId -> pending request ID (if any)
const pendingRequestIds: Ref<Record<string, string | null>> = ref<Record<string, string | null>>({});

// Track loading state per user
const isActionLoading: Ref<Record<string, boolean>> = ref<Record<string, boolean>>({});

// Received friend requests with user details
interface ReceivedRequest {
  requestId: string;
  userId: string;
  name: string;
  initials: string;
  impactPoints: number;
  mutualFriends: number;
}

const receivedRequests: Ref<ReceivedRequest[]> = ref<ReceivedRequest[]>([]);

// Groups and activities - loaded from Firebase
interface Group {
  id: string;
  name: string;
  initials: string;
  memberCount: number;
  activeEvents: number;
  color: string;
}

interface Activity {
  id: string;
  userId: string;
  name: string;
  initials: string;
  action: string;
  target: string;
  link: string;
  createdAt: any;
}

const groups: Ref<Group[]> = ref<Group[]>([]);
const activities: Ref<Activity[]> = ref<Activity[]>([]);

// VueFire realtime binding for friend requests
const receivedRequestsQuery = computed(() => friendRequests.getReceivedRequestsQuery());
const receivedRequestsDocs = useCollection(receivedRequestsQuery);

onMounted(async () => {
    // 🎯 NEW LOGIC: Check URL Hash on load
    const hash = window.location.hash.substring(1); // Removes the '#'
    if (hash === 'groups') {
        activeTab.value = 'groups';
    } else {
        // If hash is missing or unknown, default to 'friends'
        activeTab.value = 'friends'; 
    }

  await Promise.all([
    loadPeople(),
    loadReceivedRequests(),
    loadGroups(),
    loadActivities()
  ]);
  await loadFollowStatuses();
});

// Watch for changes in received requests
watch(receivedRequestsDocs, async () => {
  await loadReceivedRequests();
});

const filteredFriends = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return people.value.filter(p => p.name.toLowerCase().includes(q));
});

const filteredGroups = computed(() => groups.value.filter(g => g.name.toLowerCase().includes(searchQuery.value.toLowerCase())));

const sortedFriends = computed(() => {
  // Stable leaderboard: sort only by impact points (desc), then name to keep order stable
  return [...people.value]
    .sort((a, b) => {
      const diff = (b.impactPoints || 0) - (a.impactPoints || 0);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10); // show top 10 only
});

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .toUpperCase();
}

async function loadPeople(): Promise<void> {
  isLoading.value = true;
  try {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'users'));
    const currentId = authStore.profile?.id;
    const list: PersonInfo[] = [];
    
    for (const d of snap.docs) {
      const data = d.data();
      
      // Skip current user
      if (currentId && d.id === currentId) {
        continue;
      }
      
      // Skip deleted or inactive users (users without name/email are considered deleted)
      if (!data.name || !data.email) {
        continue;
      }
      
      // Get mutual friends count
      const mutualCount = await friendRequests.getMutualFollowsCount(d.id);
      
      list.push({
        id: d.id,
        name: data.name,
        impactPoints: data.impactPoints || 0,
        userType: data.userType,
        mutualFriends: mutualCount,
        initials: initialsFor(data.name)
      });
    }
    
    people.value = list.slice(0,16);
  } catch (e) {
    console.error('Load users failed', e);
  }
  isLoading.value = false;
}

async function loadFollowStatuses(): Promise<void> {
  const statusMap: Record<string, FollowStatus> = {};
  const requestMap: Record<string, string | null> = {};
  
  for (const person of people.value) {
    const status = await friendRequests.checkFollowStatus(person.id);
    statusMap[person.id] = status;
    
    if (status === 'requested') {
      requestMap[person.id] = await friendRequests.hasRequestPending(person.id);
    } else {
      requestMap[person.id] = null;
    }
  }
  
  friendStatusMap.value = statusMap;
  pendingRequestIds.value = requestMap;
}

async function loadReceivedRequests(): Promise<void> {
  if (!receivedRequestsDocs.value || receivedRequestsDocs.value.length === 0) return;
  
  const requests: ReceivedRequest[] = [];
  const db = getFirestore();
  
  for (const reqDoc of receivedRequestsDocs.value) {
    const reqData = reqDoc as DocumentData;
    const userDoc = await getDoc(doc(db, 'users', reqData.from));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const mutualCount = await friendRequests.getMutualFollowsCount(reqData.from);
      
      requests.push({
        requestId: reqDoc.id,
        userId: reqData.from,
        name: userData.name || 'User',
        initials: initialsFor(userData.name || 'U'),
        impactPoints: userData.impactPoints || 0,
        mutualFriends: mutualCount
      });
    }
  }
  
  receivedRequests.value = requests;
}

function getFollowButtonText(userId: string): string {
  const status = friendStatusMap.value[userId];
  switch (status) {
    case 'following':
      return 'Following';
    case 'requested':
      return 'Requested';
    case 'not_following':
    default:
      return 'Follow';
  }
}

function getFollowButtonIcon(userId: string): string {
  const status = friendStatusMap.value[userId];
  switch (status) {
    case 'following':
      return 'heroicons:check';
    case 'requested':
      return 'heroicons:clock';
    case 'not_following':
    default:
      return 'heroicons:user-plus';
  }
}

async function handleFollowAction(userId: string): Promise<void> {
  if (!authStore.profile?.id) {
    alert('Please log in to connect with people.');
    return;
  }

  const currentStatus = friendStatusMap.value[userId];
  isActionLoading.value = { ...isActionLoading.value, [userId]: true };

  try {
    if (currentStatus === 'following') {
      // Unfollow
      await friendRequests.unfollowUser(userId);
      friendStatusMap.value = { ...friendStatusMap.value, [userId]: 'not_following' };
      pendingRequestIds.value = { ...pendingRequestIds.value, [userId]: null };
    } else if (currentStatus === 'requested') {
      // Cancel request
      const requestId = pendingRequestIds.value[userId];
      if (requestId) {
        await friendRequests.cancelFollowRequest(requestId);
        friendStatusMap.value = { ...friendStatusMap.value, [userId]: 'not_following' };
        pendingRequestIds.value = { ...pendingRequestIds.value, [userId]: null };
      }
    } else {
      // Send follow request
      await friendRequests.sendFollowRequest(userId);
      friendStatusMap.value = { ...friendStatusMap.value, [userId]: 'requested' };
      const requestId = await friendRequests.hasRequestPending(userId);
      pendingRequestIds.value = { ...pendingRequestIds.value, [userId]: requestId };
    }
  } catch (e: unknown) {
    console.error('Follow action failed', e);
    const errorMessage = e instanceof Error ? e.message : 'Action failed';
    alert(errorMessage);
  } finally {
    isActionLoading.value = { ...isActionLoading.value, [userId]: false };
  }
}

// Note: Friend requests functionality removed - using pure Instagram-style follow model

async function loadGroups(): Promise<void> {
  try {
    const db = getFirestore();
    const groupsSnap = await getDocs(collection(db, 'groups'));
    groups.value = groupsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      initials: doc.data().name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    } as Group));
  } catch (e) {
    console.error('Failed to load groups', e);
  }
}

async function loadActivities(): Promise<void> {
  try {
    const db = getFirestore();
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('createdAt', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    );
    const activitiesSnap = await getDocs(activitiesQuery);
    
    const activityList: Activity[] = [];
    for (const docSnap of activitiesSnap.docs) {
      const data = docSnap.data() as DocumentData;
      const userDoc = await getDoc(doc(db, 'users', data.userId as string));
      const userName = userDoc.exists() ? userDoc.data()?.name : 'User';
      
      activityList.push({
        id: docSnap.id,
        userId: data.userId as string,
        name: userName as string,
        initials: initialsFor(userName as string),
        action: data.action as string,
        target: data.target as string,
        link: data.link as string,
        createdAt: data.createdAt
      });
    }
    
    activities.value = activityList.sort((a, b) => 
      b.createdAt?.toMillis() - a.createdAt?.toMillis()
    );
  } catch (e) {
    console.error('Failed to load activities', e);
  }
}

function formatActivityTime(createdAt: any): string {
  if (!createdAt || !createdAt.toDate) return 'recently';
  const date = createdAt.toDate();
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}
</script>
<style scoped>

/* --- UTILITIES & LAYOUT --- */
.network-container {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  overflow-y: scroll;
}

.text-orange { color: var(--color-accent); }
.text-gray-400 { color: #9ca3af; }

.section-container { margin-bottom: 2rem; }
.section-header h3 { 
  font-size: 1.1rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 1rem; 
  display: flex; align-items: center; gap: 8px; 
}
.header-icon { color: var(--color-text-sub); }

.counter-badge {
  background: var(--color-accent); /* Orange Badge */
  color: white; font-size: 0.75rem; padding: 2px 8px; border-radius: 12px;
}

/* --- HEADER & TABS --- */
.feed-header { margin-bottom: 2rem; }
.tabs { display: flex; gap: 2rem; margin: 1.5rem 0; border-bottom: 1px solid var(--color-border); }
.tabs button {
  background: none; border: none; padding: 1rem 0; font-size: 1rem; font-weight: 600; color: var(--color-text-sub); cursor: pointer; border-bottom: 2px solid transparent; transition: 0.2s;
}
.tabs button.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
.search-box { display: flex; align-items: center; background: white; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--color-border); gap: 0.5rem; }
.search-box input { border: none; outline: none; width: 100%; font-size: 0.95rem; }

/* --- FRIEND REQUESTS --- */
.requests-list { display: flex; flex-direction: column; gap: 0.75rem; }
.request-card {
  display: flex; justify-content: space-between; align-items: center;
  background: white; border: 1px solid var(--color-border); padding: 1rem; border-radius: 10px;
}
.req-left { display: flex; gap: 1rem; align-items: center; }
.req-name { font-weight: 700; color: var(--color-text-main); display: block; }
.req-meta { font-size: 0.85rem; color: var(--color-text-sub); display: flex; align-items: center; gap: 0.5rem; }
.impact-score { color: var(--color-accent); font-weight: 600; display: flex; align-items: center; gap: 4px; }
.mutual-count { color: var(--color-text-sub); font-weight: 500; display: flex; align-items: center; gap: 4px; }
.req-actions { display: flex; gap: 0.5rem; }
.btn-icon { width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-icon.check { background: #e6fffa; color: #2c7a7b; }
.btn-icon.close { background: #fff5f5; color: #c53030; }
.btn-icon:hover { transform: scale(1.1); }

/* --- SOCIAL EVENTS CARD --- */
.event-list { display: flex; flex-direction: column; gap: 0.75rem; }
.social-event-card {
  display: flex; align-items: center; gap: 1.5rem;
  background: white; border: 1px solid var(--color-border); padding: 1rem; border-radius: 12px;
  text-decoration: none; color: inherit; transition: border-color 0.2s, transform 0.2s;
}
.social-event-card:hover { border-color: var(--color-primary); transform: translateX(4px); }

.date-badge {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: var(--color-bg); padding: 0.5rem; border-radius: 8px; min-width: 60px;
}
.date-badge .month { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: var(--color-text-sub); }
.date-badge .day { font-size: 1.4rem; font-weight: 800; color: var(--color-text-main); line-height: 1; }

.event-details h4 { margin: 0 0 0.5rem 0; font-size: 1.05rem; }
.attendee-row { display: flex; align-items: center; gap: 0.75rem; }
.facepile { display: flex; }
.tiny-avatar {
  width: 24px; height: 24px; border-radius: 50%; background: #ddd; border: 2px solid white;
  font-size: 0.6rem; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-left: -8px;
}
.tiny-avatar:first-child { margin-left: 0; }
.plus-text { font-size: 0.8rem; color: var(--color-text-sub); }
.card-arrow { margin-left: auto; color: var(--color-text-sub); }

/* --- FRIENDS GRID --- */
.friends-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem; }
.friend-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  text-align: center;
  
  /* NEW: Flex column ensures the card stretches and aligns contents */
  display: flex;
  flex-direction: column;
  height: 100%; 
}
.card-header-bg { height: 50px; background: linear-gradient(to right, #e2e8f0, #f7fafc); }
.card-content {
  padding: 0 1rem 1.5rem 1rem;
  margin-top: -30px;
  display: flex;
  flex-direction: column;
  flex: 1; 
}
.avatar-lg {
  width: 64px; height: 64px; border-radius: 50%; background: var(--color-primary); color: white;
  border: 4px solid white; margin: 0 auto 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;
}
.friend-card h3 { font-size: 1rem; margin-bottom: 0.25rem; }

.streak-pill { 
  font-size: 0.75rem; background: #fff7ed; color: var(--color-accent); /* Orange background/text */
  padding: 4px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;
  font-weight: 700; margin-bottom: 0.75rem; border: 1px solid #ffedd5;
}

.badge-row {
  display: flex;
  justify-content: center;
  gap: 4px;
  min-height: 24px; 
  margin-bottom: 1rem;
}
.mini-badge-icon { color: #d69e2e; width: 20px; height: 20px; }

.btn-profile {
  margin-top: auto; 
  
  display: block;
  width: 100%;
  
  box-sizing: border-box; 
  
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  color: var(--color-text-main);
  font-weight: 600;
  transition: 0.2s;
  background: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.btn-profile:hover { background: var(--color-bg); }
.btn-profile:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-profile.btn-friends {
  background: #e6fffa;
  border-color: #2c7a7b;
  color: #2c7a7b;
}

.btn-profile.btn-pending {
  background: #fff7ed;
  border-color: #fb923c;
  color: #ea580c;
}

.btn-profile.btn-respond {
  background: #eff6ff;
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-row {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.mutual-badge {
  font-size: 0.75rem;
  color: var(--color-text-sub);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* --- GROUPS --- */
.groups-grid { display: grid; gap: 1rem; }
.group-card {
  display: flex; flex-direction: column; background: white; border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit;
}
.group-banner { height: 8px; width: 100%; }
.group-info-block { padding: 1.25rem; display: flex; gap: 1rem; align-items: center; }
.group-icon { width: 48px; height: 48px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; color: #555; }
.group-text h2 { margin: 0; font-size: 1.1rem; }
.group-text p { margin: 4px 0 0 0; color: var(--color-text-sub); font-size: 0.85rem; }

/* --- SIDEBAR WIDGETS --- */
.widget { background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; }
.widget h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }

/* Activity */
.activity-list { display: flex; flex-direction: column; gap: 1rem; }
.activity-item { display: flex; gap: 0.75rem; font-size: 0.9rem; }
.act-content p { margin: 0; line-height: 1.4; color: var(--color-text-sub); }
.act-content .name { font-weight: 600; color: var(--color-text-main); }
.act-link { color: var(--color-primary); text-decoration: none; font-weight: 500; }
.act-link:hover { text-decoration: underline; }
.act-content .time { font-size: 0.75rem; color: #999; display: block; margin-top: 2px; }

/* Leaderboard */
.widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.widget-header h3 { margin: 0; display: flex; align-items: center; gap: 8px;}
.widget-header .label { font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
.leader-list { display: flex; flex-direction: column; gap: 0.5rem; }
.leader-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #f7f7f7; }
.leader-row:last-child { border-bottom: none; }
.rank { font-weight: 600; color: #aaa; width: 24px; text-align: center; display: flex; justify-content: center; }
.rank.top-rank { color: #d69e2e; }
.leader-name { flex: 1; font-weight: 600; font-size: 0.9rem; }
.leader-pts { font-weight: 700; color: var(--color-primary); font-size: 0.9rem; }

/* Invite */
.invite-form { display: flex; gap: 0.5rem; margin-top: 1rem; }
.invite-form input { flex: 1; border: 1px solid var(--color-border); padding: 8px; border-radius: 6px; font-size: 0.9rem; outline: none; }
.invite-form button { 
  background: var(--color-text-main); color: white; border: none; padding: 0 12px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center;
}

/* Avatars */
.avatar-xs { width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; }
.avatar-md { width: 42px; height: 42px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: bold; }

/* Responsive */
@media (max-width: 900px) {
  .network-container { grid-template-columns: 1fr; }
  .side-widgets { order: -1; }
}
</style>