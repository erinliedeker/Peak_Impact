<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <img src="~/assets/images/logo.png" alt="Peak Impact Logo" class="logo"/>
      <h1 class="logo-text">Peak Impact</h1>
    </div>

    <nav class="nav-links">
      
      <NuxtLink to="/feed" class="nav-item" active-class="active">
        <Icon name="heroicons:newspaper-solid" class="icon" />
        <span class="label">Feed</span>
      </NuxtLink>

      <NuxtLink to="/events" class="nav-item" active-class="active">
        <Icon name="heroicons:map-solid" class="icon" />
        <span class="label">Events</span>
      </NuxtLink>

      <NuxtLink to="/organizations" class="nav-item" active-class="active">
        <Icon name="heroicons:building-office-2-solid" class="icon" />
        <span class="label">Organizations</span>
      </NuxtLink>

      <NuxtLink to="/network" class="nav-item" active-class="active">
        <Icon name="heroicons:users-solid" class="icon" />
        <span class="label">My Network</span>
      </NuxtLink>

      <NuxtLink to="/friends" class="nav-item" active-class="active">
        <Icon name="heroicons:user-group-solid" class="icon" />
        <span class="label">Friends</span>
      </NuxtLink>

      <NuxtLink to="/my-events" class="nav-item" active-class="active">
        <Icon name="heroicons:ticket-solid" class="icon" />
        <span class="label">My Events</span>
      </NuxtLink>

      <NuxtLink to="/inbox" class="nav-item" active-class="active">
        <Icon name="heroicons:chat-bubble-left-right-solid" class="icon" />
        <span class="label">Inbox</span>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </NuxtLink>

      <NuxtLink to="/profile" class="nav-item" active-class="active">
        <Icon name="heroicons:user-circle-solid" class="icon" />
        <span class="label">Profile</span>
      </NuxtLink>

      <NuxtLink to="/reports" class="nav-item" active-class="active">
        <Icon name="heroicons:chart-bar-square-solid" class="icon" />
        <span class="label">Reports</span>
      </NuxtLink>

      <div v-if="auth.isOrgAdmin" class="org-section">
        <p class="section-title">MANAGEMENT</p>
        <NuxtLink to="/org/dashboard" class="nav-item org-link" active-class="active">
          <Icon name="heroicons:cog-6-tooth-solid" class="icon" />
          <span class="label">Org Dashboard</span>
        </NuxtLink>
      </div>
    </nav>
    
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
/* Sidebar Container */
.sidebar {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  padding-bottom: 2rem; /* Safety buffer for the footer */
  background-color: var(--color-white, #ffffff);
  border-right: 1px solid var(--color-border);
  z-index: 50;
  overflow: hidden;
  box-sizing: border-box;
}

/* Header & Logo */
.sidebar-header {
  display: flex;
  flex-direction: row;
  margin-bottom: 2.5rem;
  padding-left: 0.5rem;
}

.logo {
  width: 60px;
  height:auto;
  padding-right: 20px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary); /* Pikes Peak Blue */
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 1.75rem;
  color: var(--color-primary);
}

/* Navigation Links */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1; /* Pushes the footer down */
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  color: var(--color-text-sub); /* Granite Grey */
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background-color: var(--color-bg); /* Snow Capped Background */
  color: var(--color-text-main);
}

/* Active State */
.nav-item.active {
  background-color: #EBF8FF; /* Very light blue tint */
  color: var(--color-primary); /* Pikes Peak Blue */
  border-left: 4px solid var(--color-accent); 
}

/* Icon Styling */
.icon {
  font-size: 1.5rem;
  min-width: 24px;
  color: inherit;
}

/* Inbox Badge */
.badge {
  margin-left: auto;
  background-color: var(--color-accent); /* Garden Sandstone (Orange) */
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
  border-top: 1px solid var(--color-border);
}

.section-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-sub);
  margin-bottom: 0.75rem;
  padding-left: 16px;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.org-link {
  color: var(--color-accent);
}

.org-link.active {
  background-color: #FFF5F5;
  color: var(--color-accent);
}

/* Footer & Profile */
.sidebar-footer {
  margin-top: auto; /* Uses flex-grow from nav-links to sit at bottom */
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background-color: var(--color-primary);
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
  color: var(--color-text-main);
}

.logout-btn {
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  font-size: 0.8rem;
  color: var(--color-text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logout-btn:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

.login-btn {
  display: block;
  width: 100%;
  text-align: center;
  background-color: var(--color-primary);
  color: white;
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.9;
}
</style>