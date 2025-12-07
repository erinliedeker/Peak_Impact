<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useAuthStore } from '~~/stores/auth';
import { useOrgStore } from '~~/stores/orgs';
import { storeToRefs } from 'pinia';

// 1. Initialize Stores
const authStore = useAuthStore();
const orgStore = useOrgStore();

// 2. Destructure State for Reactivity
// NOTE: ownedOrganizations is now ownedOrganization (singular)
const { profile, isAuthInitialized, isOrgAdmin } = storeToRefs(authStore);
const { ownedOrganization, isLoading, error } = storeToRefs(orgStore);

/**
 * Loads the organization for the current user.
 */
const loadOrgData = async () => {
  console.log("loadOrg", profile.value)
  // NOTE: You should ensure 'profile.value.uid' is used instead of 'profile.value.id' 
  // since Firebase Auth uses 'uid' and the service uses 'userId'.
  if (profile.value && profile.value.organizationId) { 
    await orgStore.fetchOwnedOrganizations(profile.value.organizationId);
  }
};

/**
 * WATCHER: Handles Page Refreshes
 */
watch(profile, (newProfile) => {
  if (newProfile) {
    loadOrgData();
  }
}, { immediate: true });

// Optional: You might also want to clear sensitive data on unmount
// onUnmounted(() => { orgStore.$reset() });
</script>

<template>
  <div>
    <h1>Organization Dashboard</h1>

    <div v-if="!isAuthInitialized">
      <p>Checking authentication...</p>
    </div>

    <div v-else-if="authStore.isLoggedIn && !isOrgAdmin">
      <h3>Access Denied</h3>
      <p>You are logged in as a <strong>{{ profile?.userType }}</strong>.</p>
      <p>This dashboard is for Organization Administrators only.</p>
    </div>

    <div v-else-if="authStore.isLoggedIn">
      <p>Welcome back, {{ authStore.userName }}!</p>

      <hr />

      <div>
        <button @click="loadOrgData" :disabled="isLoading">
          Refresh Data
        </button>
        <button v-if="!ownedOrganization">Create New Organization</button>
      </div>

      <hr />

      <div v-if="isLoading">
        <p>Loading your organization...</p>
      </div>

      <div v-else-if="error" style="color: red;">
        <p>{{ error }}</p>
      </div>

      <div v-else>
        <h2>Your Organization Details</h2>

        <div v-if="!ownedOrganization">
          <p>You haven't registered an organization yet. Click "Create New Organization" to get started.</p>
        </div>

        <div v-else>
          <h3>{{ ownedOrganization.name }}</h3>
          <p><strong>Type:</strong> {{ ownedOrganization.type }}</p>
          <p><strong>Role:</strong> Admin</p>
          
          <div style="background: #f0f0f0; padding: 10px; margin-top: 5px;">
            <p>ID: {{ ownedOrganization.id }}</p>
            <p>EIN: {{ ownedOrganization.ein || 'N/A' }}</p>
            <p>Email: {{ ownedOrganization.contactEmail }}</p>
            <p>Admins: {{ ownedOrganization.admins.length }}</p>
          </div>
          
          <br />
          <button>Edit Details</button>
          <button>Manage Events</button>
        </div>
      </div>
    </div>

    <div v-else>
      <p>Please log in to view your dashboard.</p>
      <a href="/login">Go to Login</a>
    </div>
  </div>
</template>