<template>
  <header class="app-header">
    <div class="left">
      <h1 class="title" :title="title">{{ title }}</h1>
    </div>

    <div class="right">
      <!-- Notifications -->
      <div class="control" ref="notifRoot">
        <button class="icon-btn" @click="toggleNotifs" aria-haspopup="true" :aria-expanded="showNotifs">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a6 6 0 0 0-6 6v3.586L4.293 15.293A1 1 0 0 0 5 17h14a1 1 0 0 0 .707-1.707L18 11.586V8a6 6 0 0 0-6-6zM7 19a5 5 0 0 0 10 0H7z"/></svg>
          <span v-if="notifCount > 0" class="badge">{{ notifCount }}</span>
        </button>

        <div v-if="showNotifs" class="dropdown">
          <div class="dropdown-header">Notifications</div>
          <ul class="notif-list">
            <li v-for="(n, i) in notifications" :key="i" class="notif-item">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-time">{{ n.time }}</div>
            </li>
            <li v-if="notifications.length === 0" class="empty">No notifications</li>
          </ul>
          <div class="dropdown-footer">
            <button class="link-btn" @click="markAllRead">Mark all read</button>
          </div>
        </div>
      </div>

      <!-- Profile -->
      <div class="control" ref="profileRoot">
        <button class="profile-btn" @click="toggleProfile" aria-haspopup="true" :aria-expanded="showProfile">
          <img v-if="user.avatar" :src="user.avatar" alt="avatar" class="avatar"/>
          <span v-else class="avatar avatar-initials">{{ initials }}</span>
        </button>

        <div v-if="showProfile" class="dropdown profile-dropdown">
          <div class="profile-info">
            <div class="name">{{ user.name }}</div>
            <div class="email">{{ user.email }}</div>
          </div>
          <ul class="profile-actions">
            <li><button @click="goToProfile">My Profile</button></li>
            <li><button @click="signOut" class="danger">Sign out</button></li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Basic route -> title map (adjust to your app)
const titleMap = {
  feed: 'Feed',
  events: 'Events',
  organizations: 'Organizations',
  myEvents: 'My Events',
  profile: 'Profile',
}

// derive presentational title from route
const title = computed(() => {
  // prefer explicit meta.title or route.name mapped value
  if (route.meta && route.meta.title) return route.meta.title
  if (route.name && titleMap[route.name]) return titleMap[route.name]
  // fallback: format path (/some/long-path -> "Some / Long Path")
  const p = route.path.replace(/^\//, '')
  if (!p) return 'Home'
  return p.split('/').map(s => s.replace(/-/g, ' ')).map(capitalize).join(' / ')
})

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/* Notifications state (replace with real data/props/api) */
const notifications = ref([
  { title: 'New comment on your post', time: '2h' },
  { title: 'Project “Peak” updated', time: '1d' }
])
const notifCount = computed(() => notifications.value.length)
const showNotifs = ref(false)
function toggleNotifs() { showNotifs.value = !showNotifs.value }
function markAllRead() { notifications.value = []; showNotifs.value = false }

/* Profile state (replace with auth) */
const user = ref({ name: 'Nate Watson', email: 'nate@example.com', avatar: '' })
const initials = computed(() => {
  return user.value.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
})
const showProfile = ref(false)
function toggleProfile() { showProfile.value = !showProfile.value }
function goToProfile() { router.push({ name: 'profile' }).catch(()=>{}); showProfile.value = false }
function openSettings() { router.push({ name: 'settings' }).catch(()=>{}); showProfile.value = false }
function signOut() { /* implement sign out */ console.log('sign out'); showProfile.value = false }

/* close dropdowns on outside click */
const notifRoot = ref(null)
const profileRoot = ref(null)

function onDocumentClick(e) {
  if (notifRoot.value && !notifRoot.value.contains(e.target)) showNotifs.value = false
  if (profileRoot.value && !profileRoot.value.contains(e.target)) showProfile.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

// optional: update document title or other side-effects on route change
watch(() => route.fullPath, (newPath) => {
  // keep small — you may update page title here if desired
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  gap: 12px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
.left .title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 48ch;
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn, .profile-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  position: relative;
}

.icon { width: 20px; height: 20px; fill: currentColor; color: #374151; }

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  object-fit: cover;
  background: #e5e7eb;
  display: inline-block;
}
.avatar-initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-weight: 600;
}

/* dropdowns */
.control { position: relative; }
.dropdown {
  position: absolute;
  right: 0;
  margin-top: 8px;
  width: 260px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(15,23,42,0.08);
  z-index: 50;
  overflow: hidden;
}
.dropdown-header {
  padding: 10px 12px;
  font-weight: 600;
  border-bottom: 1px solid #f3f4f6;
}
.notif-list { max-height: 220px; overflow: auto; padding: 8px; list-style: none; margin: 0; }
.notif-item { padding: 8px; border-radius: 6px; display: flex; justify-content: space-between; gap: 8px; }
.notif-item + .notif-item { margin-top: 6px; }
.empty { padding: 12px; text-align: center; color: #6b7280; }

.dropdown-footer { padding: 8px; border-top: 1px solid #f3f4f6; text-align: right; }

.profile-dropdown { width: 220px; right: 0; }
.profile-info { padding: 12px; border-bottom: 1px solid #f3f4f6; }
.profile-info .name { font-weight: 600 }
.profile-info .email { font-size: 12px; color: #6b7280 }
.profile-actions { list-style: none; margin: 0; padding: 8px; }
.profile-actions li { margin: 6px 0; }
.link-btn { background: none; border: none; color: #2563eb; cursor: pointer; }
.danger { color: #ef4444; background: none; border: none; cursor: pointer; }
</style>