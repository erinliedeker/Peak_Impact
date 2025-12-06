<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="logo">Connect COS 🏔️</h1>
    </div>

    <nav class="nav-links">
      
      <NuxtLink to="/feed" class="nav-item" active-class="active">
        <span class="icon">📰</span>
        <span class="label">Feed</span>
      </NuxtLink>

      <NuxtLink to="/events" class="nav-item" active-class="active">
        <span class="icon">🗓️</span>
        <span class="label">Events</span>
      </NuxtLink>

      <NuxtLink to="/organizations" class="nav-item" active-class="active">
        <span class="icon">🏢</span>
        <span class="label">Organizations</span>
      </NuxtLink>

      <NuxtLink to="/my-events" class="nav-item" active-class="active">
        <span class="icon">🎟️</span>
        <span class="label">My Events</span>
      </NuxtLink>

      <NuxtLink to="/inbox" class="nav-item" active-class="active">
        <span class="icon">💬</span>
        <span class="label">Inbox</span>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </NuxtLink>

      <div v-if="auth.isOrgAdmin" class="org-section">
        <p class="section-title">MANAGEMENT</p>
        <NuxtLink to="/org/dashboard" class="nav-item org-link" active-class="active">
          <span class="icon">⚙️</span>
          <span class="label">Org Dashboard</span>
        </NuxtLink>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div v-if="auth.isLoggedIn" class="user-info">
        <div class="avatar-circle">
          {{ auth.userName.charAt(0) }}
        </div>
        <div class="user-details">
          <p class="user-name">{{ auth.userName }}</p>
          <button @click="handleLogout" class="logout-btn">Log Out</button>
        </div>
      </div>
      
      <div v-else class="login-prompt">
        <NuxtLink to="/login" class="login-btn">Log In</NuxtLink>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

// Mock unread count for the Inbox badge
const unreadCount = 3; 

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
}

.sidebar-header {
  margin-bottom: 2.5rem;
  padding-left: 0.5rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2c5282;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  color: #64748b; /* Slate grey */
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

/* Active State */
.nav-item.active {
  background-color: #ebf8ff; /* Light Blue BG */
  color: #2b6cb0; /* Brand Blue Text */
}

.icon {
  font-size: 1.2rem;
  min-width: 24px;
  text-align: center;
}

/* Inbox Badge Styling */
.badge {
  margin-left: auto;
  background-color: #e53e3e; /* Red */
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

/* Org Section */
.org-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.section-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 0.75rem;
  padding-left: 16px;
  letter-spacing: 0.05em;
}

.org-link {
  color: #d97706; /* Amber for admin */
}

/* Footer & Profile */
.sidebar-footer {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background-color: #2b6cb0;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
}

.logout-btn {
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  font-size: 0.8rem;
  color: #94a3b8;
  cursor: pointer;
}

.logout-btn:hover {
  color: #e53e3e;
  text-decoration: underline;
}

.login-btn {
  display: block;
  width: 100%;
  text-align: center;
  background-color: #2b6cb0;
  color: white;
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}
</style>