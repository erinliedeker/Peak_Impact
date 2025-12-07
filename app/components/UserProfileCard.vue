<template>
  <div class="profile-card">
    
    <div class="avatar-section">
      <div class="avatar-wrapper">
        <img v-if="localUser.photoUrl" :src="localUser.photoUrl" alt="Profile" class="avatar-img" />
        <div v-else class="avatar-placeholder">{{ initials }}</div>

        <label class="upload-btn">
          <Icon name="heroicons:camera" class="icon-white" />
          <input type="file" accept="image/*" @change="handleFileUpload" hidden />
        </label>
      </div>
    </div>

    <div class="info-section">
      
      <div v-if="!isEditing" class="view-mode">
        <h2 class="name">{{ localUser.name }}</h2>
        <span class="user-type badge">{{ localUser.userType }}</span>
        
        <div class="stats-row">
          <div class="stat">
            <strong>{{ auth.currentImpactPoints }}</strong>
            <span>Impact</span>
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
        
        <div class="details">
          
          <div class="detail-row">
            <Icon name="heroicons:envelope" class="icon" /> {{ localUser.email }}
          </div>
          
          <div class="detail-row">
            <Icon name="heroicons:map-pin" class="icon" /> 
            
            <span class="detail-label">{{ props.communityInfo.label }}:</span>
            
            <NuxtLink 
               :to="props.communityInfo.link" 
               :class="{'link-style': props.communityInfo.exists, 'text-muted': !props.communityInfo.exists}"
            >
               {{ props.communityInfo.name }}
            </NuxtLink>
          </div>
          
          <div class="detail-row">
            <Icon name="heroicons:calendar" class="icon" /> Member since March 2025
          </div>
        </div>

        <button @click="isEditing = true" class="edit-btn">Edit Profile</button>
      </div>

      <div v-else class="edit-mode">
        <div class="form-group">
          <label>Full Name</label>
          <input v-model="localUser.name" type="text" />
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
import { computed, ref, reactive, onMounted } from 'vue'; 
import { useAuthStore } from '../stores/auth';
import { useFriendRequests } from '~~/composables/useFriendRequests';
import { getDocs, collection, query, where, getFirestore } from 'firebase/firestore';

const auth = useAuthStore();
const friendRequests = useFriendRequests();
const isEditing = ref(false);
const followerCount = ref(0);
const followingCount = ref(0);

// Define the prop passed from the parent ([id].vue)
const props = defineProps({
  communityInfo: {
    type: Object,
    default: () => ({ name: 'Join a Group', link: '/groups', label: 'Community Focus', exists: false })
  }
});

// Create a local copy of user data
const localUser = reactive({
  name: auth.userName,
  email: auth.profile?.email || 'user@example.com',
  userType: auth.profile?.userType || 'Resident',
  neighborhood: auth.profile?.neighborhoodId?.toString() || '',
  photoUrl: auth.profile?.photoUrl || null
});

const initials = computed(() => localUser.name.split(' ').map(n => n[0]).join('').substring(0, 2));

// Fetch follower/following counts
onMounted(async () => {
  if (auth.profile?.id) {
    await fetchFriendCounts();
  }
});

async function fetchFriendCounts() {
  if (!auth.profile?.id) return;
  
  try {
    const followers = await friendRequests.getFollowers(auth.profile.id);
    followerCount.value = followers.length;
    
    const following = await friendRequests.getFollowing(auth.profile.id);
    followingCount.value = following.length;
  } catch (e) {
    console.error('Failed to fetch friend counts', e);
  }
}

// Simulate File Upload
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Create a fake local URL for preview
    localUser.photoUrl = URL.createObjectURL(file);
    alert("Photo updated! (This is local only for now)");
  }
};

const saveChanges = async () => {
  try {
    const db = getFirestore();
    if (auth.profile?.id) {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', auth.profile.id), {
        name: localUser.name,
        // Removed neighborhood update logic
      });
      
      // Update auth display name
      const currentUser = useCurrentUser().value;
      if (currentUser) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(currentUser, { displayName: localUser.name });
      }
      
      // Refresh profile
      await auth.fetchUserProfile(auth.profile.id);
      isEditing.value = false;
    }
  } catch (e) {
    console.error('Failed to update profile', e);
    alert('Failed to save changes');
  }
};

const cancelEdit = () => {
  localUser.name = auth.userName; // Revert
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
.upload-btn .icon-white {
    color: white;
    width: 1em;
    height: 1em;
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

.stats-row {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat strong {
  font-size: 1.5rem;
  color: var(--color-text-main);
  font-weight: 700;
}

.stat span {
  font-size: 0.85rem;
  color: var(--color-text-sub);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.detail-row .icon {
  /* Style for icons replacing Emojis */
  color: var(--color-text-sub); 
  width: 1.25em; 
  height: 1.25em;
  margin-right: 5px; 
}

.detail-row .detail-label {
  font-weight: 600;
  color: var(--color-text-main);
  margin-right: 5px;
}

.detail-row .link-style {
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: underline;
}

.detail-row .text-muted {
  color: var(--color-text-sub);
  font-style: italic;
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