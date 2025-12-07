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
                <strong>{{ viewedUser.followerCount || 0 }}</strong>
                <span>Followers</span>
              </div>
              <div class="stat">
                <strong>{{ viewedUser.followingCount || 0 }}</strong>
                <span>Following</span>
              </div>
            </div>
          </div>

          <div class="action-section">
            <button 
              @click="toggleFollow" 
              class="btn icon-btn"
              :class="isFollowing ? 'btn-secondary' : 'btn-primary'"
            >
              <Icon :name="isFollowing ? 'heroicons:check' : 'heroicons:user-plus'" />
              {{ isFollowing ? 'Following' : 'Follow' }}
            </button>
            <button class="btn btn-outline icon-btn">
              <Icon name="heroicons:chat-bubble-left-ellipsis" /> Message
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
              <article v-for="event in mockHistory" :key="event.id" class="list-item">
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
            <div class="org-chips">
              <NuxtLink 
                v-for="org in mockOrgs" 
                :key="org.id" 
                :to="`/organizations/${org.id}`" 
                class="org-chip"
              >
                <img :src="org.logo" class="org-logo-sm" />
                {{ org.name }}
              </NuxtLink>
            </div>
          </section>
        </div>

        <div class="right-col">
          
          <div v-if="!isFollowing" class="locked-feed profile-card">
            <Icon name="heroicons:lock-closed" size="40" class="lock-icon" />
            <h4>Follow {{ viewedUser.name }} to see their posts</h4>
            <p>Connect with volunteers to see their updates, photos, and shared impact stories.</p>
            <button @click="toggleFollow" class="btn btn-sm btn-primary">Follow Now</button>
          </div>

          <div v-else>
            <h3 class="feed-title">Recent Activity Feed</h3>
            
            <div v-for="post in mockPosts" :key="post.id" class="profile-card post-card">
              <div class="post-header">
                <img :src="viewedUser.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + viewedUser.name" class="avatar-xs" />
                <div>
                  <strong>{{ viewedUser.name }}</strong>
                  <span class="text-muted"> • {{ post.timeAgo }}</span>
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '~~/stores/auth';
import type { UserProfile } from '~~/types/user'; // Your provided interface

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userId = route.params.id as string;

// --- 1. Extended Type Definition ---
// We extend your base UserProfile to include fields needed for the UI
// In the future, you should add these fields to your Firestore 'users' collection
interface ExtendedUserProfile extends UserProfile {
  avatarUrl?: string;
  badges?: string[];
  followerCount?: number;
  followingCount?: number;
}

// --- 2. State ---
const viewedUser = ref<ExtendedUserProfile | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isFollowing = ref(false); // Tracks if the logged-in user follows this profile

// --- 3. Mock Data (To replace with DB subcollections later) ---
const mockHistory = ref([
  { id: '101', title: 'Community Garden Build', orgId: 'org1', orgName: 'Green Earth', date: '2023-11-02', hours: 4 },
  { id: '102', title: 'Food Drive Sort', orgId: 'org2', orgName: 'City Pantry', date: '2023-10-20', hours: 2 },
]);

const mockOrgs = ref([
  { id: 'org1', name: 'Green Earth', logo: 'https://via.placeholder.com/30/22c55e/ffffff?text=G' },
  { id: 'org2', name: 'City Pantry', logo: 'https://via.placeholder.com/30/3b82f6/ffffff?text=C' },
]);

const mockPosts = ref([
  { 
    id: 'p1', 
    content: 'Just finished 4 hours at the community garden! The new beds look amazing. 🌱 #volunteer #cos', 
    image: 'https://via.placeholder.com/600x300/e2e8f0/64748b?text=Garden+Photo',
    timeAgo: '2h ago',
    likes: 12
  },
  { 
    id: 'p2', 
    content: 'Big thanks to City Pantry for organizing the food drive today. So many families helped.', 
    image: null,
    timeAgo: '1d ago',
    likes: 8
  }
]);

// --- 4. Actions ---

onMounted(async () => {
  if (authStore.profile?.id === userId) {
    // Optional: Redirect to "My Profile" if viewing self
    router.replace('/profile');
    return;
  }
  await fetchUserProfile();
  // checkFollowStatus(); // TODO: Implement API check
});

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

function toggleFollow() {
  // TODO: Call API to add/remove from 'relationships' collection
  isFollowing.value = !isFollowing.value;
  
  if (isFollowing.value) {
    // Optimistic UI update
    if (viewedUser.value) {
        viewedUser.value.followerCount = (viewedUser.value.followerCount || 0) + 1;
    }
  } else {
    if (viewedUser.value) {
        viewedUser.value.followerCount = (viewedUser.value.followerCount || 1) - 1;
    }
  }
}

// --- Helpers ---
function formatDate(dateString: string) {
  const d = new Date(dateString);
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
.btn-outline { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-main); }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }

@keyframes spin { 100% { transform: rotate(360deg); } }
</style>