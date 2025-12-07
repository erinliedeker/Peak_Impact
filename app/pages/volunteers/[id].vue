<template>
  <div class="page-container">
    
    <div v-if="isLoading" class="state-screen">
      <Icon name="heroicons:arrow-path" class="spinner" size="32" />
      <p>Loading profile...</p>
    </div>

    <div v-else-if="error || !viewedUser" class="state-screen">
      <Icon name="heroicons:user-minus" size="48" class="text-muted" />
      <h3>User Not Found</h3>
      <button class="btn btn-secondary icon-btn" @click="$router.go(-1)">
        <Icon name="heroicons:arrow-left" /> Go Back
      </button>
    </div>

    <div v-else class="profile-content">
      
      <header class="profile-card header-card">
        <div class="cover-photo"></div> <div class="header-body">
          <div class="avatar-section">
            <img 
              :src="viewedUser.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + viewedUser.name" 
              alt="Avatar" 
              class="avatar-img"
            />
          </div>

          <div class="identity-section">
            <div class="name-row">
              <h1>{{ viewedUser.name }}</h1>
              <span class="badge badge-role">{{ viewedUser.userType }}</span>
            </div>
            
            <p class="meta-row">
              <span v-if="viewedUser.neighborhoodId">
                <Icon name="heroicons:map-pin" class="icon-xs" /> Neighborhood #{{ viewedUser.neighborhoodId }}
              </span>
              <span class="dot-sep">•</span>
              <span>Joined 2024</span>
            </p>

            <div class="stats-row">
              <div class="stat">
                <strong>{{ viewedUser.impactPoints }}</strong>
                <span>Impact Score</span>
              </div>
              <div class="stat">
                <strong>{{ followerCount }}</strong>
                <span>Followers</span>
              </div>
              <div class="stat">
                <strong>{{ followingCount }}</strong>
                <span>Following</span>
              </div>
            </div>
          </div>

          <div class="action-section">
            <button 
              @click="handleFollowAction" 
              class="btn icon-btn"
              :class="{
                'btn-primary': followStatus === 'not_following',
                'btn-secondary': followStatus === 'following' || followStatus === 'requested'
              }"
              :disabled="isActionLoading"
            >
              <Icon :name="getFollowButtonIcon()" />
              {{ getFollowButtonText() }}
            </button>
            <button 
              @click="fetchFollowerCounts" 
              class="btn icon-btn btn-secondary"
              :disabled="isActionLoading"
              title="Refresh follower/following counts"
            >
              <Icon name="heroicons:arrow-path" />
            </button>
          </div>
        </div>
      </header>

      <div class="layout-grid">
        
        <div class="left-col">
          
          <section class="profile-card">
            <h3>
              <Icon name="heroicons:clock" class="text-muted" /> 
              Recent Volunteering
            </h3>
            
            <div class="list-container">
              <div v-if="eventHistory.length === 0" class="empty-state">
                <p>No volunteering history yet</p>
              </div>
              <article v-for="event in eventHistory" :key="event.id" class="list-item">
                <div class="date-box">
                  <span class="month">{{ formatDate(event.date).month }}</span>
                  <span class="day">{{ formatDate(event.date).day }}</span>
                </div>
                <div class="item-details">
                  <NuxtLink :to="`/events/${event.id}`" class="item-link">
                    {{ event.title }}
                  </NuxtLink>
                  <p class="sub-text">
                    at 
                    <NuxtLink :to="`/organizations/${event.orgId}`" class="org-link">
                      {{ event.orgName }}
                    </NuxtLink>
                  </p>
                </div>
                <div class="points-badge">
                  +{{ event.hours * 10 }} pts
                </div>
              </article>
            </div>
          </section>

          <section class="profile-card">
            <h3>
              <Icon name="heroicons:building-library" class="text-muted" /> 
              Member Organizations
            </h3>
            <div v-if="userOrgs.length === 0" class="empty-state">
              <p style="padding: 0px 20px">Not a member of any organizations yet</p>
            </div>
            <div v-else class="org-chips">
              <NuxtLink 
                v-for="org in userOrgs" 
                :key="org.id" 
                :to="`/organizations/${org.id}`" 
                class="org-chip"
              >
                <div v-if="org.logo" class="org-logo-sm">
                  <img :src="org.logo" />
                </div>
                <div v-else class="org-logo-sm org-initials">
                  {{ org.name.substring(0, 2).toUpperCase() }}
                </div>
                {{ org.name }}
              </NuxtLink>
            </div>
          </section>
        </div>

        <div class="right-col">
          
          <div v-if="followStatus !== 'following'" class="locked-feed profile-card">
            <Icon name="heroicons:lock-closed" size="40" class="lock-icon" />
            <h4>Follow {{ viewedUser.name }} to see their posts</h4>
            <p>Follow to see their updates, photos, and shared impact stories.</p>
            <button 
              @click="handleFollowAction" 
              class="btn btn-sm btn-primary"
              :disabled="isActionLoading"
            >
              {{ getFollowButtonText() }}
            </button>
          </div>

          <div v-else>
            <h3 class="feed-title">Recent Activity Feed</h3>
            
            <div v-if="userPosts.length === 0" class="profile-card empty-state">
              <p>No posts yet</p>
            </div>
            
            <div v-for="post in userPosts" :key="post.id" class="profile-card post-card">
              <div class="post-header">
                <img :src="viewedUser.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + viewedUser.name" class="avatar-xs" />
                <div>
                  <strong>{{ viewedUser.name }}</strong>
                  <span class="text-muted"> • {{ formatActivityTime(post.createdAt) }}</span>
                </div>
              </div>
              
              <p class="post-text">{{ post.content }}</p>
              
              <div v-if="post.image" class="post-image">
                <img :src="post.image" alt="Post content" />
              </div>

              <div class="post-actions">
                <button class="action-btn">
                  <Icon name="heroicons:heart" /> {{ post.likes }}
                </button>
                <button class="action-btn">
                  <Icon name="heroicons:chat-bubble-oval-left" /> Comment
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFirestore, doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { useAuthStore } from '~~/stores/auth';
import { useFriendRequests } from '~~/composables/useFriendRequests';
import type { UserProfile } from '~~/types/user';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const friendRequests = useFriendRequests();
const userId = route.params.id as string;

// --- 1. Extended Type Definition ---
interface ExtendedUserProfile extends UserProfile {
  avatarUrl?: string;
  badges?: string[];
}

// --- 2. State ---
const viewedUser = ref<ExtendedUserProfile | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const followStatus = ref<'following' | 'requested' | 'not_following'>('not_following');
const pendingRequestId = ref<string | null>(null);
const followerCount = ref(0);
const followingCount = ref(0);
const isActionLoading = ref(false);

// --- 3. Data from Firebase ---
interface EventHistory {
  id: string;
  title: string;
  orgId: string;
  orgName: string;
  date: any;
  hours: number;
}

interface UserOrg {
  id: string;
  name: string;
  logo?: string;
  type?: string;
}

interface UserPost {
  id: string;
  content: string;
  image?: string;
  createdAt: any;
  likes: number;
}

const eventHistory = ref<EventHistory[]>([]);
const userOrgs = ref<UserOrg[]>([]);
const userPosts = ref<UserPost[]>([]);

// --- 4. Actions ---

onMounted(async () => {
  if (authStore.profile?.id === userId) {
    router.replace('/profile');
    return;
  }
  await fetchUserProfile();
  await Promise.all([
    checkFollowStatus(), 
    fetchFollowerCounts(),
    fetchEventHistory(),
    fetchUserOrgs(),
    fetchUserPosts()
  ]);
});

// Watch for route changes - when navigating to a different volunteer profile
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId && newId) {
    // Route changed - component will reload via key
    return;
  }
}, { immediate: false });

async function fetchUserProfile() {
  isLoading.value = true;
  try {
    const db = getFirestore();
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      viewedUser.value = docSnap.data() as ExtendedUserProfile;
    } else {
      error.value = "User not found";
    }
  } catch (e) {
    console.error(e);
    error.value = "Error loading profile";
  } finally {
    isLoading.value = false;
  }
}

async function checkFollowStatus() {
  if (!authStore.profile?.id) return;
  
  followStatus.value = await friendRequests.checkFollowStatus(userId);
  
  if (followStatus.value === 'requested') {
    pendingRequestId.value = await friendRequests.hasRequestPending(userId);
  }
}

async function fetchFollowerCounts() {
  try {
    const followers = await friendRequests.getFollowers(userId);
    console.log(`[${userId}] Followers:`, followers);
    followerCount.value = followers.length;
    
    const following = await friendRequests.getFollowing(userId);
    console.log(`[${userId}] Following:`, following);
    followingCount.value = following.length;
  } catch (e) {
    console.error('Failed to load follower counts', e);
  }
}

function getFollowButtonText(): string {
  switch (followStatus.value) {
    case 'following':
      return 'Following';
    case 'requested':
      return 'Requested';
    case 'not_following':
    default:
      return 'Follow';
  }
}

function getFollowButtonIcon(): string {
  switch (followStatus.value) {
    case 'following':
      return 'heroicons:check';
    case 'requested':
      return 'heroicons:clock';
    case 'not_following':
    default:
      return 'heroicons:user-plus';
  }
}

async function handleFollowAction() {
  if (!authStore.profile?.id) {
    alert('Please log in to follow people.');
    return;
  }

  isActionLoading.value = true;

  try {
    if (followStatus.value === 'following') {
      // Unfollow
      await friendRequests.unfollowUser(userId);
      followStatus.value = 'not_following';
    } else if (followStatus.value === 'requested') {
      // Cancel request
      if (pendingRequestId.value) {
        await friendRequests.cancelFollowRequest(pendingRequestId.value);
        followStatus.value = 'not_following';
        pendingRequestId.value = null;
      }
    } else {
      // Send follow request
      await friendRequests.sendFollowRequest(userId);
      followStatus.value = 'requested';
      pendingRequestId.value = await friendRequests.hasRequestPending(userId);
    }
    // Refresh counts from database
    await fetchFollowerCounts();
  } catch (e: any) {
    console.error('Follow action failed', e);
    alert(e.message || 'Action failed');
  } finally {
    isActionLoading.value = false;
  }
}

async function fetchEventHistory() {
  try {
    const db = getFirestore();
    const historyQuery = query(
      collection(db, 'eventParticipants'),
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );
    const historySnap = await getDocs(historyQuery);
    
    const history: EventHistory[] = [];
    for (const docSnap of historySnap.docs) {
      const data = docSnap.data();
      const eventDoc = await getDoc(doc(db, 'events', data.eventId));
      const orgDoc = eventDoc.exists() && eventDoc.data().organizationId 
        ? await getDoc(doc(db, 'organizations', eventDoc.data().organizationId))
        : null;
      
      if (eventDoc.exists()) {
        history.push({
          id: docSnap.id,
          title: eventDoc.data().title,
          orgId: eventDoc.data().organizationId || '',
          orgName: orgDoc?.exists() ? orgDoc.data().name : 'Organization',
          date: data.completedAt || data.createdAt,
          hours: data.hours || 0
        });
      }
    }
    eventHistory.value = history;
  } catch (e) {
    console.error('Failed to load event history', e);
  }
}

async function fetchUserOrgs() {
  try {
    const db = getFirestore();
    const orgsQuery = query(
      collection(db, 'organizationMembers'),
      where('userId', '==', userId)
    );
    const orgsSnap = await getDocs(orgsQuery);
    
    const orgs: UserOrg[] = [];
    for (const docSnap of orgsSnap.docs) {
      const data = docSnap.data();
      const orgDoc = await getDoc(doc(db, 'organizations', data.organizationId));
      if (orgDoc.exists()) {
        orgs.push({
          id: orgDoc.id,
          name: orgDoc.data().name,
          logo: orgDoc.data().logo,
          type: orgDoc.data().type
        });
      }
    }
    userOrgs.value = orgs;
  } catch (e) {
    console.error('Failed to load user organizations', e);
  }
}

async function fetchUserPosts() {
  try {
    const db = getFirestore();
    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', userId)
    );
    const postsSnap = await getDocs(postsQuery);
    
    userPosts.value = postsSnap.docs.map(docSnap => ({
      id: docSnap.id,
      content: docSnap.data().content,
      image: docSnap.data().image,
      createdAt: docSnap.data().createdAt,
      likes: docSnap.data().likes || 0
    })).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  } catch (e) {
    console.error('Failed to load user posts', e);
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

// --- Helpers ---
function formatDate(dateObj: any) {
  if (!dateObj || !dateObj.toDate) return { month: '', day: '' };
  const d = dateObj.toDate();
  return {
    month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
    day: d.getDate()
  };
}
</script>

<style scoped>
/* Main Container */
.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
  color: var(--color-text-main);
}

.state-screen { text-align: center; padding: 50px; color: var(--color-text-muted); }
.spinner { animation: spin 1s linear infinite; color: var(--color-primary); }

/* --- Header Card --- */
.profile-card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  margin-bottom: 24px;
  overflow: hidden;
}

.cover-photo {
  height: 120px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-bg-light));
}

.header-body {
  padding: 0 30px 30px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 20px;
  margin-top: -60px; /* Pulls content up over cover photo */
}

.avatar-img {
  width: 120px; height: 120px;
  border-radius: 50%;
  border: 5px solid white;
  background: white;
  object-fit: cover;
}

.identity-section { flex: 1; padding-top: 65px; /* Spacing for avatar overlap */ }

.name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
.name-row h1 { margin: 0; font-size: 1.8rem; }
.badge-role { 
  background: var(--color-bg-light); border: 1px solid var(--color-border);
  padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; 
}

.meta-row { color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 15px; display: flex; align-items: center; gap: 6px; }
.dot-sep { font-weight: bold; margin: 0 4px; }

.stats-row { display: flex; gap: 20px; }
.stat { display: flex; flex-direction: column; }
.stat strong { font-size: 1.1rem; color: var(--color-text-main); }
.stat span { font-size: 0.8rem; color: var(--color-text-muted); }

.action-section { padding-top: 70px; display: flex; gap: 10px; }


/* --- Layout Grid --- */
.layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 850px) {
  .layout-grid { grid-template-columns: 350px 1fr; }
}

/* --- Section Styles --- */
h3 { font-size: 1.1rem; margin: 0 0 15px; padding: 15px 20px 0; display: flex; align-items: center; gap: 8px; }
.text-muted { color: var(--color-text-muted); }

/* List Items (Events) */
.list-container { padding: 15px 20px 20px; display: flex; flex-direction: column; gap: 15px; }

.list-item { display: flex; gap: 12px; align-items: center; }

.date-box {
  background: var(--color-bg-light);
  border-radius: 6px; padding: 6px 10px; text-align: center;
  border: 1px solid var(--color-border); min-width: 50px;
}
.date-box .month { display: block; font-size: 0.7rem; font-weight: 700; color: var(--color-primary); }
.date-box .day { display: block; font-size: 1.2rem; font-weight: 700; line-height: 1; }

.item-details { flex: 1; }
.item-link { display: block; font-weight: 600; color: var(--color-text-main); text-decoration: none; }
.item-link:hover { color: var(--color-primary); }
.sub-text { margin: 2px 0 0; font-size: 0.85rem; color: var(--color-text-muted); }
.org-link { color: var(--color-text-muted); text-decoration: none; font-weight: 500; }
.org-link:hover { text-decoration: underline; }

.points-badge { 
  font-size: 0.8rem; font-weight: 600; color: var(--color-success); background: #f0fdf4; padding: 2px 6px; border-radius: 4px; 
}


/* Organizations Chips */
.org-chips { padding: 0 20px 20px; display: flex; flex-wrap: wrap; gap: 10px; }
.org-chip {
  display: flex; align-items: center; gap: 8px;
  background: var(--color-bg-light); border: 1px solid var(--color-border);
  padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; text-decoration: none; color: var(--color-text-main); transition: background 0.2s;
}
.org-chip:hover { background: #e2e8f0; }
.org-logo-sm { width: 20px; height: 20px; border-radius: 50%; }


/* --- Feed / Posts --- */
.locked-feed {
  text-align: center; padding: 40px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.lock-icon { color: var(--color-secondary); opacity: 0.5; }

.feed-title { margin-top: 0; padding-left: 0; margin-bottom: 15px; }

.post-card { padding: 20px; }
.post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.avatar-xs { width: 36px; height: 36px; border-radius: 50%; }

.post-text { margin-bottom: 15px; line-height: 1.5; }
.post-image img { width: 100%; border-radius: 8px; margin-bottom: 15px; }

.post-actions { display: flex; gap: 15px; border-top: 1px solid var(--color-bg-light); padding-top: 15px; }
.action-btn { 
  background: none; border: none; cursor: pointer; color: var(--color-text-muted); 
  display: flex; align-items: center; gap: 6px; font-size: 0.9rem; 
}
.action-btn:hover { color: var(--color-primary); }


/* --- Global Buttons & Icons --- */
.icon-btn { display: inline-flex; align-items: center; gap: 6px; justify-content: center; }
.btn { padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-secondary { background: var(--color-bg-light); color: var(--color-text-main); border: 1px solid var(--color-border); }
.btn-secondary:hover { background: #e2e8f0; }
.btn-pending {
  background: #fff7ed;
  border: 1px solid #fb923c;
  color: #ea580c;
}
.btn-respond {
  background: #eff6ff;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}
.btn-outline { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-main); }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

@keyframes spin { 100% { transform: rotate(360deg); } }
</style>