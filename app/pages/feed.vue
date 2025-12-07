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
        <div v-if="!expandPostForm" class="post-header">
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
            <div class="post-org-select">
              <label>Post to:</label>
              <select v-model="postOrg" class="org-select">
                <option value="">My Feed</option>
                <option v-for="org in organizations" :key="org.id" :value="org.id">
                  {{ org.name }}
                </option>
              </select>
            </div>
            <div class="post-actions">
              <button @click="expandPostForm = false" class="btn-cancel">Cancel</button>
              <button @click="handleCreatePost" class="btn-post" :disabled="!newPostText.trim() || loading">
                {{ loading ? 'Posting...' : 'Post' }}
              </button>
            </div>
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
                <p v-if="post.organizationName" class="post-org">@ {{ post.organizationName }}</p>
              </div>
            </div>
          </div>

          <!-- Post Content -->
          <div class="post-content">
            <p class="post-text">{{ post.text }}</p>
            
            <!-- Photo display removed: Firebase Storage not available -->
          </div>

          <!-- Post Stats -->
          <div class="post-stats">
            <span>❤️ {{ post.likes.length }} likes</span>
            <span>💬 {{ post.commentsCount }} comments</span>
          </div>

          <!-- Post Actions -->
          <div class="post-actions-row">
            <button 
              class="action-btn" 
              :class="{ liked: isLikedByUser(post) }"
              @click="handleLike(post)"
            >
              {{ isLikedByUser(post) ? '❤️' : '🤍' }} Like
            </button>
            <button class="action-btn" @click="toggleComments(post.id)">💬 Comment</button>
            <button class="action-btn" @click="copyShareLink(post.id)">↗️ Share</button>
          </div>

          <!-- Comments Section -->
          <div v-if="showComments[post.id]" class="comments-section">
            <!-- Comment Input -->
            <div class="comment-input-wrapper">
              <div class="comment-avatar">{{ userInitials }}</div>
              <input
                v-model="commentTexts[post.id]"
                type="text"
                placeholder="Write a comment..."
                class="comment-input"
                @keyup.enter="submitComment(post.id)"
              >
              <button
                @click="submitComment(post.id)"
                :disabled="!commentTexts[post.id]?.trim()"
                class="comment-submit-btn"
              >
                Post
              </button>
            </div>

            <!-- Comments List -->
            <div v-if="postComments[post.id]?.length" class="comments-list">
              <div v-for="comment in postComments[post.id]" :key="comment.id" class="comment-item">
                <div class="comment-avatar-small">{{ getInitials(comment.authorName) }}</div>
                <div class="comment-bubble">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.authorName }}</span>
                    <span class="comment-time">{{ formatTime(comment.timestamp) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.text }}</p>
                </div>
              </div>
            </div>
            
            <p v-else class="no-comments">No comments yet. Be the first to comment!</p>
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
import { ref, computed, watch, onUnmounted } from 'vue'
import { collection, query, orderBy, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { useAuthStore } from '../../stores/auth'
import { useFeed } from '../../composables/useFeed'
import { useCollection } from 'vuefire'
import type { Post } from '../../types'

const authStore = useAuthStore()
const { createPost, toggleLike, addComment, getAllPostsQuery, getOrgPostsQuery } = useFeed()
const db = useFirestore()

// State
const loading = ref(false)
const expandPostForm = ref(false)
const newPostText = ref('')
// Photo upload state removed: Firebase Storage not available
const postOrg = ref('')
const selectedOrg = ref<any>(null)
const userEventCount = ref(0)
const userHours = ref(0)

// Comments state
const showComments = ref<Record<string, boolean>>({})
const commentTexts = ref<Record<string, string>>({})
const postComments = ref<Record<string, any[]>>({})
const commentsUnsubscribers = ref<Record<string, Unsubscribe>>({})

// Mock organizations for now - TODO: Replace with real Firestore org data
const organizations = ref([
  { id: 'org-1', name: 'Mountain View High School' },
  { id: 'org-2', name: 'Community Action Network' },
  { id: 'org-3', name: 'Youth Leadership Initiative' }
])

// Real-time posts from Firestore
const postsQuery = computed(() => {
  if (selectedOrg.value?.id) {
    return getOrgPostsQuery(selectedOrg.value.id)
  }
  return getAllPostsQuery()
})

const feedPostsRaw = useCollection(postsQuery, { ssrKey: 'feed-posts' })

// Normalize Firestore docs into UI-friendly objects
const feedPosts = computed<Post[]>(() => {
  return (feedPostsRaw.value || []).map((doc: any) => {
    const timestamp = doc.timestamp?.toDate ? doc.timestamp.toDate() : (doc.timestamp || new Date())
    return {
      id: doc.id || doc.__id || '',
      authorId: doc.authorId || '',
      authorName: doc.authorName || 'User',
      text: doc.text || '',
      // photoUrl removed: Firebase Storage not available
      organizationId: doc.organizationId || null,
      organizationName: doc.organizationName || null,
      timestamp,
      likes: Array.isArray(doc.likes) ? doc.likes : [],
      commentsCount: doc.commentsCount || 0
    }
  })
})

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
// handlePhotoUpload removed: Firebase Storage not available

// Create new post
async function handleCreatePost() {
  if (!newPostText.value.trim()) return

  loading.value = true
  
  try {
    const orgData = postOrg.value 
      ? organizations.value.find(o => o.id === postOrg.value)
      : null

    await createPost(
      newPostText.value,
      null,
      orgData?.id || null,
      orgData?.name || null
    )

    // Reset form
    newPostText.value = ''
    // Photo upload state reset removed
    postOrg.value = ''
    expandPostForm.value = false
  } catch (err: any) {
    console.error('[Feed] Create post error:', err)
    alert('Failed to create post: ' + err.message)
  } finally {
    loading.value = false
  }
}

// Handle like toggle
async function handleLike(post: Post) {
  try {
    await toggleLike(post.id, post.likes)
  } catch (err: any) {
    console.error('[Feed] Like error:', err)
  }
}

// Check if current user liked a post
function isLikedByUser(post: Post): boolean {
  if (!authStore.profile) return false
  return post.likes.includes(String(authStore.profile.id))
}

// Format time helper
function formatTime(value: any): string {
  const date = value?.toDate ? value.toDate() : value
  const target = date instanceof Date ? date : new Date()

  const now = new Date()
  const diff = now.getTime() - target.getTime()
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

// Clear photo preview when photo is removed
// clearPhoto removed: Firebase Storage not available

// Copy share link to clipboard
function copyShareLink(postId: string) {
  const link = `${window.location.origin}/feed?post=${postId}`
  navigator.clipboard.writeText(link).then(() => {
    alert('Link copied to clipboard!')
  }).catch(err => {
    console.error('Failed to copy link:', err)
  })
}

// Toggle comments visibility
function toggleComments(postId: string) {
  showComments.value[postId] = !showComments.value[postId]
  
  // Load comments when opening
  if (showComments.value[postId] && !postComments.value[postId]) {
    loadComments(postId)
  }
}

// Load comments for a post
function loadComments(postId: string) {
  const commentsRef = collection(db, 'posts', postId, 'comments')
  const q = query(commentsRef, orderBy('timestamp', 'desc'))
  
  // Real-time listener
  const unsubscribe = onSnapshot(q, (snapshot) => {
    postComments.value[postId] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date()
    }))
  })
  
  commentsUnsubscribers.value[postId] = unsubscribe
}

// Submit a comment
async function submitComment(postId: string) {
  const text = commentTexts.value[postId]?.trim()
  if (!text) return

  try {
    await addComment(postId, text)
    commentTexts.value[postId] = '' // Clear input
  } catch (error: any) {
    console.error('[Feed] Comment error:', error)
    alert('Failed to post comment: ' + error.message)
  }
}

// Cleanup: unsubscribe from comment listeners
onUnmounted(() => {
  Object.values(commentsUnsubscribers.value).forEach(unsubscribe => unsubscribe?.())
})

// Set sample stats for now
userEventCount.value = 8
userHours.value = 42.5
</script>

<style scoped>
.feed-page {
  height: 100%;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-bg-light);
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
}

.post-textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.post-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.post-options {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  gap: 25px;
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

.action-btn.liked {
  color: #ef4444;
  font-weight: 600;
}

/* Comments Section */
.comments-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.comment-input-wrapper {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.comment-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.comment-submit-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.comment-submit-btn:hover:not(:disabled) {
  background: #764ba2;
}

.comment-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  align-items: start;
}

.comment-avatar-small {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.comment-bubble {
  flex: 1;
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.75rem 1rem;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.comment-author {
  font-weight: 600;
  font-size: 0.85rem;
  color: #1e293b;
}

.comment-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.comment-text {
  font-size: 0.9rem;
  color: #475569;
  margin: 0;
  line-height: 1.5;
}

.no-comments {
  text-align: center;
  padding: 1.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
  font-style: italic;
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

  .post-actions-row {
    grid-template-columns: 1fr;
  }

  .action-btn {
    border-bottom: 1px solid #f1f5f9;
  }
}
</style>