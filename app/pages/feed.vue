<template>
  <div class="feed-page">
    <!-- Sidebar -->
    <aside class="feed-sidebar">
      <div class="sidebar-card">
        <h3 class="sidebar-title">Profile</h3>
        <div class="profile-preview">
          <div class="profile-avatar">{{ userInitials }}</div>
          <p class="profile-name">{{ authStore.profile?.name || 'User' }}</p>
          <p class="profile-type">{{ authStore.profile?.userType || 'Volunteer' }}</p>
        </div>
      </div>

      <div class="sidebar-card">
        <h3 class="sidebar-title">Impact Stats</h3>
        <div class="stats-list">
          <div class="stat-row">
            <span class="stat-label">Impact Points</span>
            <span class="stat-num">{{ authStore.profile?.impactPoints || 0 }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Events</span>
            <span class="stat-num">{{ userEventCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Hours</span>
            <span class="stat-num">{{ userHours.toFixed(1) }}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-card">
        <h3 class="sidebar-title">Your Organizations</h3>
        <div class="org-list-sidebar">
          <button 
            v-for="org in organizations" 
            :key="org.id"
            @click="selectedOrg = org"
            class="org-btn"
            :class="{ active: selectedOrg?.id === org.id }"
          >
            {{ org.name }}
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Feed -->
    <main class="feed-main">
      <!-- Create Post Section -->
      <div class="create-post">
        <div class="post-header">
          <div class="user-avatar-small">{{ userInitials }}</div>
          <input 
            v-model="newPostText"
            type="text" 
            placeholder="Share an update about your volunteer experience..."
            class="post-input"
            @focus="expandPostForm = true"
          />
        </div>
        
        <div v-if="expandPostForm" class="post-form-expanded">
          <textarea 
            v-model="newPostText"
            placeholder="What would you like to share? Tell us about an event, opportunity, or impact moment..."
            class="post-textarea"
            rows="4"
          ></textarea>
          
          <div class="post-options">
            <div class="file-upload">
              <label class="upload-btn">
                📷 Add Photo
                <input type="file" accept="image/*" style="display: none" @change="handlePhotoUpload" />
              </label>
              <div v-if="postPhoto" class="photo-preview">
                <div class="photo-item">
                  <img :src="postPhoto" :alt="'Preview'" />
                  <button @click="postPhoto = null" class="remove-photo">✕</button>
                </div>
              </div>
            </div>

            <div class="post-org-select">
              <label>Post to:</label>
              <select v-model="postOrg" class="org-select">
                <option value="">My Feed</option>
                <option v-for="org in organizations" :key="org.id" :value="org.id">
                  {{ org.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="post-actions">
            <button @click="expandPostForm = false" class="btn-cancel">Cancel</button>
            <button @click="createPost" class="btn-post" :disabled="!newPostText.trim()">
              Post
            </button>
          </div>
        </div>
      </div>

      <!-- Posts Feed -->
      <div class="posts-container">
        <div v-if="feedPosts.length === 0" class="empty-feed">
          <p>No posts yet. Be the first to share your volunteer story! 🌟</p>
        </div>

        <div 
          v-for="post in feedPosts" 
          :key="post.id"
          class="post-card"
        >
          <!-- Post Header -->
          <div class="post-header-card">
            <div class="post-user-info">
              <div class="post-avatar">{{ getInitials(post.authorName) }}</div>
              <div class="post-meta">
                <p class="post-author">{{ post.authorName }}</p>
                <p class="post-time">{{ formatTime(post.timestamp) }}</p>
                <p v-if="post.organization" class="post-org">@ {{ post.organization }}</p>
              </div>
            </div>
          </div>

          <!-- Post Content -->
          <div class="post-content">
            <p class="post-text">{{ post.text }}</p>
            
            <div v-if="post.photo" class="post-photo">
              <img :src="post.photo" :alt="'Post image'" />
            </div>
          </div>

          <!-- Post Stats -->
          <div class="post-stats">
            <span>❤️ {{ post.likes }} likes</span>
            <span>💬 {{ post.comments }} comments</span>
          </div>

          <!-- Post Actions -->
          <div class="post-actions-row">
            <button class="action-btn">❤️ Like</button>
            <button class="action-btn">💬 Comment</button>
            <button class="action-btn">↗️ Share</button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        Loading posts...
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

// State
const loading = ref(false)
const expandPostForm = ref(false)
const newPostText = ref('')
const postPhoto = ref<string | null>(null)
const postOrg = ref('')
const selectedOrg = ref<any>(null)
const userEventCount = ref(0)
const userHours = ref(0)

// Mock data - replace with real Firestore queries
const organizations = ref([
  { id: 'org-1', name: 'Mountain View High School' },
  { id: 'org-2', name: 'Community Action Network' },
  { id: 'org-3', name: 'Youth Leadership Initiative' }
])

// Mock posts - will replace with real Firestore data
const feedPosts = ref<Array<{
  id: string
  authorId: string
  authorName: string
  text: string
  timestamp: Date
  photo: string | null
  organization?: string
  likes: number
  comments: number
}>>([
  {
    id: '1',
    authorId: 'user-2',
    authorName: 'Sarah Chen',
    text: 'Just finished volunteering at the community cleanup! Made so many new friends and helped remove over 200 lbs of trash from the park. Feeling great about making a difference! 🌍',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    photo: null,
    organization: 'Mountain View High School',
    likes: 24,
    comments: 5
  },
  {
    id: '2',
    authorId: 'user-3',
    authorName: 'Marcus Johnson',
    text: 'Our team just hit 500 volunteer hours! Thanks to everyone who showed up to the food bank drives. Next goal: 1000! 🎯',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    photo: null,
    organization: 'Community Action Network',
    likes: 45,
    comments: 12
  },
  {
    id: '3',
    authorId: 'user-4',
    authorName: 'Emma Rodriguez',
    text: 'Mentoring high school students on resume building! It\'s amazing to see them grow and gain confidence. This is why I volunteer! 💪',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    photo: null,
    organization: 'Youth Leadership Initiative',
    likes: 38,
    comments: 8
  }
])

// Computed properties
const userInitials = computed(() => {
  const name = authStore.profile?.name || 'User'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
})

// Handle photo upload
function handlePhotoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      postPhoto.value = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

// Create new post
function createPost() {
  if (!newPostText.value.trim()) return

  const newPost = {
    id: String(Date.now()),
    authorId: authStore.profile?.id ? String(authStore.profile.id) : 'current-user',
    authorName: authStore.profile?.name || 'You',
    text: newPostText.value,
    timestamp: new Date(),
    photo: postPhoto.value,
    organization: postOrg.value 
      ? organizations.value.find(o => o.id === postOrg.value)?.name 
      : undefined,
    likes: 0,
    comments: 0
  }

  feedPosts.value.unshift(newPost)
  newPostText.value = ''
  postPhoto.value = null
  postOrg.value = ''
  expandPostForm.value = false
}

// Format time helper
function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

// Initialize
onMounted(() => {
  // Set sample stats
  userEventCount.value = 8
  userHours.value = 42.5
})
</script>

<style scoped>
.feed-page {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}

/* ============ SIDEBAR ============ */
.feed-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.sidebar-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sidebar-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.profile-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.profile-type {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 4px;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.stat-num {
  font-size: 1rem;
  font-weight: 700;
  color: #667eea;
}

.org-list-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.org-btn {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #64748b;
  transition: all 0.2s;
  text-align: left;
}

.org-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.org-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* ============ MAIN FEED ============ */
.feed-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Create Post */
.create-post {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.user-avatar-small {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.post-input {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  color: #64748b;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
}

.post-input:hover {
  background: #e2e8f0;
}

.post-input:focus {
  outline: none;
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.post-form-expanded {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.post-textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
}

.post-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.post-options {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
}

.file-upload {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #667eea;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #f0f4ff;
}

.photo-preview {
  position: relative;
}

.photo-item {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  max-width: 200px;
}

.photo-item img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-photo {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.remove-photo:hover {
  background: rgba(0, 0, 0, 0.8);
}

.post-org-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-org-select label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.org-select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.org-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.post-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-post {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-cancel {
  background: #e2e8f0;
  color: #64748b;
}

.btn-cancel:hover {
  background: #cbd5e1;
}

.btn-post {
  background: #667eea;
  color: white;
}

.btn-post:hover:not(:disabled) {
  background: #764ba2;
}

.btn-post:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Posts Container */
.posts-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-feed {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 8px;
  color: #64748b;
}

/* Post Card */
.post-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-header-card {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.post-user-info {
  display: flex;
  gap: 1rem;
}

.post-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.post-meta {
  flex: 1;
}

.post-author {
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  font-size: 0.95rem;
}

.post-time {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0.25rem 0 0 0;
}

.post-org {
  font-size: 0.85rem;
  color: #667eea;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.post-content {
  padding: 0 1.5rem 1.5rem;
}

.post-text {
  font-size: 0.95rem;
  color: #1e293b;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.post-photo {
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.post-photo img {
  width: 100%;
  height: auto;
  display: block;
}

.post-stats {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #64748b;
}

.post-actions-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}

.action-btn {
  padding: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  border-radius: 0;
}

.action-btn:hover {
  background: #f8fafc;
  color: #667eea;
}

.action-btn:active {
  background: #f1f5f9;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #667eea;
}

/* Responsive */
@media (max-width: 1024px) {
  .feed-page {
    grid-template-columns: 1fr;
  }

  .feed-sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .sidebar-card {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .feed-page {
    padding: 1rem;
    gap: 1rem;
  }

  .feed-sidebar {
    grid-template-columns: 1fr;
  }

  .post-options {
    grid-template-columns: 1fr;
  }

  .post-actions-row {
    grid-template-columns: 1fr;
  }

  .action-btn {
    border-bottom: 1px solid #f1f5f9;
  }
}
</style>