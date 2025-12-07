<template>
  <header class="app-header">
    <h2 class="page-title">{{ pageTitle }}</h2>

    <div class="right-actions">
      
      <div class="control relative" ref="notifRef">
        <button class="icon-btn" @click="showNotifs = !showNotifs">
          <Icon name="heroicons:bell-solid" size="1.4rem" />
          <span v-if="notifications.length" class="badge">{{ notifications.length }}</span>
        </button>

        <div v-if="showNotifs" class="dropdown notif-drop">
          <div class="drop-header">Notifications</div>
          <ul>
            <li v-for="n in notifications" :key="n.id" class="notif-item">
              {{ n.text }}
            </li>
            <li v-if="!notifications.length" class="empty">No new alerts</li>
          </ul>
        </div>
      </div>

      <div class="control relative" ref="profileRef">
        <button class="profile-btn" @click="showProfile = !showProfile">
          <span class="name">{{ auth.userName }}</span>
          <div class="avatar">{{ auth.userName ? auth.userName.charAt(0) : 'U' }}</div>
        </button>

        <div v-if="showProfile" class="dropdown profile-drop">
          <NuxtLink to="/profile" class="drop-item" @click="showProfile = false">
            My Profile
          </NuxtLink>
          <button @click="handleLogout" class="drop-item danger">
            Log Out
          </button>
        </div>
      </div>

    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// UI State
const showNotifs = ref(false);
const showProfile = ref(false);
const notifRef = ref(null);
const profileRef = ref(null);

// Mock Data
const notifications = ref([
  { id: 1, text: 'New event: Creek Cleanup nearby' }
]);

// Compute Title based on Route Name
const pageTitle = computed(() => {
  // If we are on /events/123, just say "Event Details"
  if (route.params.id) return 'Details';
  
  const name = route.name || 'home';
  // "my-events" -> "My Events"
  return name.toString().split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
});

// Logout Logic
const handleLogout = () => {
  auth.logout(false);
  router.push('/');
};

// Close dropdowns when clicking outside
const closeDropdowns = (e) => {
  if (!notifRef.value?.contains(e.target)) showNotifs.value = false;
  if (!profileRef.value?.contains(e.target)) showProfile.value = false;
};

onMounted(() => document.addEventListener('click', closeDropdowns));
onUnmounted(() => document.removeEventListener('click', closeDropdowns));
</script>

<style scoped>
.app-header {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: relative; 
  z-index: 40;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Icon Button */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-sub);
  position: relative;
  display: flex;
  padding: 5px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--color-accent);
  color: white;
  font-size: 0.65rem;
  padding: 2px 5px;
  border-radius: 10px;
  font-weight: 700;
}

/* Profile Button */
.profile-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.name {
  font-weight: 600;
  color: var(--color-text-main);
  font-size: 0.9rem;
}

.avatar {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

/* Dropdowns */
.relative { position: relative; }

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 8px;
  min-width: 200px;
  overflow: hidden;
  z-index: 50;
}

.drop-header {
  padding: 10px;
  font-weight: 700;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
  font-size: 0.85rem;
  color: var(--color-text-sub);
}

.dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notif-item {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
  color: var(--color-text-main);
}

.drop-item {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-main);
  text-decoration: none;
  font-size: 0.9rem;
}

.drop-item:hover {
  background: var(--color-bg);
}

.danger { color: #e53e3e; }
.empty { padding: 1rem; text-align: center; color: var(--color-text-sub); font-size: 0.9rem; }
</style>