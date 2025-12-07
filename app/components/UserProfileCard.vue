<template>
  <div class="profile-card">
    
    <div class="avatar-section">
      <div class="avatar-wrapper">
        <!-- <img v-if="localUser.photoUrl" :src="localUser.photoUrl" alt="Profile" class="avatar-img" /> -->
        <div class="avatar-placeholder">{{ initials }}</div>

        <label class="upload-btn">
          <span>📷</span>
          <input type="file" accept="image/*" @change="handleFileUpload" hidden />
        </label>
      </div>
    </div>

    <div class="info-section">
      
      <div v-if="!isEditing" class="view-mode">
        <h2 class="name">{{ localUser.name }}</h2>
        <span class="user-type badge">{{ localUser.userType }}</span>
        
        <div class="details">
          <div class="detail-row">
            <span class="icon">📧</span> {{ localUser.email }}
          </div>
          <div class="detail-row">
            <span class="icon">🏡</span> {{ localUser.neighborhood || 'No Neighborhood Selected' }}
          </div>
          <div class="detail-row">
            <span class="icon">📅</span> Member since March 2025
          </div>
        </div>

        <button @click="isEditing = true" class="edit-btn">Edit Profile</button>
      </div>

      <div v-else class="edit-mode">
        <div class="form-group">
          <label>Full Name</label>
          <input v-model="localUser.name" type="text" />
        </div>
        <div class="form-group">
          <label>Neighborhood</label>
          <select v-model="localUser.neighborhood">
            <option value="Old North End">Old North End</option>
            <option value="Briargate">Briargate</option>
            <option value="Downtown">Downtown</option>
            <option value="Manitou">Manitou Springs</option>
          </select>
        </div>
        
        <div class="action-buttons">
          <button @click="saveChanges" class="save-btn">Save</button>
          <button @click="cancelEdit" class="cancel-btn">Cancel</button>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const isEditing = ref(false);

// 1. Computed property for the source user data (directly from the store)
// This will be null or the actual profile.
const sourceUser = computed(() => auth.profile);

// 2. Local state for editing: initialized from sourceUser and watched for updates
// This holds the data currently being edited.
const localUser = ref({});

// 3. Status Check: Only show profile if we have a profile object AND the auth is initialized.
const isProfileReady = computed(() => auth.isAuthInitialized && !!auth.profile);

// 4. Watch for changes in the source user (i.e., successful profile fetch) 
// and initialize/update the local state IF we are not currently editing.
watch(sourceUser, (newProfile) => {
  if (newProfile && !isEditing.value) {
    // Deep copy the profile data for local editing
    localUser.value = { ...newProfile }; 
  }
}, { immediate: true, deep: true });


// Computed initials, safely accessing the name from localUser
const initials = computed(() => {
  const name = localUser.value.name;
  return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2) : '?';
});

// Simulate File Upload (using localUser.value)
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // For local preview
    localUser.value.photoUrl = URL.createObjectURL(file);
    alert("Photo updated! (This is local only for now)");
  }
};

const saveChanges = () => {
  if (!auth.isLoggedIn || !auth.profile) {
    alert('Cannot save changes: Not logged in or profile unavailable.');
    isEditing.value = false;
    return;
  }

  // TODO: Implement auth.updateProfile() action here.
  
  // For demonstration: sync changes back to the store (assuming Pinia action does this)
  if (auth.profile) {
    auth.profile.name = localUser.value.name;
    auth.profile.neighborhood = localUser.value.neighborhood;
  }
  
  isEditing.value = false;
};

const cancelEdit = () => {
  // Revert localUser back to the current state of sourceUser
  localUser.value = { ...sourceUser.value }; 
  isEditing.value = false;
};
</script>

<style scoped>
.profile-card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  text-align: center;
}

.avatar-section {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  padding: 2rem 0 3rem 0; /* Extra padding at bottom for overlap */
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  margin-bottom: -60px; /* Pull avatar down to overlap sections */
}

.avatar-img, .avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-primary);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.upload-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: var(--color-accent);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid white;
  font-size: 0.9rem;
}

.info-section {
  padding: 4rem 2rem 2rem 2rem;
}

.name {
  font-size: 1.5rem;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.badge {
  background: #EBF8FF;
  color: var(--color-primary);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.details {
  margin-top: 1.5rem;
  text-align: left;
  color: var(--color-text-sub);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.edit-btn, .save-btn, .cancel-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem;
}

.edit-btn {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
}

.save-btn {
  background: var(--color-primary);
  color: white;
  border: none;
}

.cancel-btn {
  background: transparent;
  border: none;
  color: var(--color-text-sub);
  margin-top: 0.5rem;
}

/* Edit Mode Form */
.form-group {
  text-align: left;
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
  color: var(--color-text-sub);
}
.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}
</style>