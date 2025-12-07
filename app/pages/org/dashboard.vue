<template>
  <div class="dashboard-container">
    
    <div v-if="!isAuthInitialized" class="loading-screen">
      <div class="spinner"></div>
      <p>Verifying authentication...</p>
    </div>

    <div v-else-if="authStore.isLoggedIn && !isOrgAdmin" class="access-denied">
      <h3>Access Denied</h3>
      <p>
        You are logged in as a <strong>{{ profile?.userType }}</strong
        >. This area is restricted to Organization Administrators.
      </p>
    </div>

    <div v-else-if="!authStore.isLoggedIn" class="login-prompt">
      <p>Please log in to access your dashboard.</p>
      <button class="btn btn-primary" @click="$router.push('/login')">Go to Login</button>
    </div>

    <div v-else class="dashboard-content">
      
      <header class="dashboard-header">
        <div>
          <h1>Organization Dashboard</h1>
          <p class="subtitle">Welcome back, {{ authStore.userName }}</p>
        </div>
        <button 
          @click="loadDashboardData" 
          :disabled="orgIsLoading" 
          class="btn btn-outline icon-btn"
        >
          <Icon name="heroicons:arrow-path" :class="{ 'spin': orgIsLoading }" />
          {{ orgIsLoading ? 'Refreshing...' : 'Refresh Data' }}
        </button>
      </header>

      <div v-if="orgError || eventError" class="alert alert-error">
        <strong>Error:</strong> {{ orgError || eventError }}
      </div>

      <main>
        
        <transition name="fade">
          <section v-if="todaysEvents.length > 0" class="active-events-section">
            <div class="section-header">
              <h3>
                Happening Today 
                <span class="pulse">●</span>
              </h3>
              <p>Manage check-ins and verify hours for active events.</p>
            </div>
            
            <div v-for="event in todaysEvents" :key="event.id" class="live-card">
              <div class="live-info">
                <h4>{{ event.title }}</h4>
                <div class="live-meta">
                  <span>
                    <Icon name="heroicons:clock" class="icon-sm" /> 
                    {{ event.time }}
                  </span>
                  <span>
                    <Icon name="heroicons:map-pin" class="icon-sm" /> 
                    {{ event.location.lat ? 'Location Set' : 'No Location' }}
                  </span>
                  <span>
                    <Icon name="heroicons:users" class="icon-sm" /> 
                    {{ event.volunteersSignedUp }} / {{ event.volunteersNeeded }} Volunteers
                  </span>
                </div>
              </div>
              <button @click="openCheckInModal(event)" class="btn btn-primary btn-large icon-btn">
                Manage Check-In 
                <Icon name="heroicons:arrow-right" />
              </button>
            </div>
          </section>
        </transition>

        <div v-if="!ownedOrganization && !orgIsLoading" class="empty-state">
          <div class="empty-content">
            <h3>No Organization Found</h3>
            <p>You haven't created an organization profile yet.</p>
            <button class="btn btn-primary">Create Organization</button>
          </div>
        </div>

        <div v-else-if="ownedOrganization">
          
          <div class="org-banner">
            <h2>{{ ownedOrganization.name }}</h2>
            <span class="badge badge-admin">Admin Mode</span>
          </div>

          <div class="action-bar">
            <h3>Upcoming Events</h3>
            <button 
              @click="toggleForm" 
              class="btn icon-btn"
              :class="showCreateForm ? 'btn-secondary' : 'btn-primary'"
            >
              <Icon :name="showCreateForm ? 'heroicons:x-mark' : 'heroicons:plus'" />
              {{ showCreateForm ? 'Cancel' : 'New Event' }}
            </button>
          </div>

          <transition name="fade">
            <section v-if="showCreateForm" class="form-panel">
              <h3 class="form-title">{{ editingEventId ? 'Edit Event' : 'Post New Event' }}</h3>
              
              <form @submit.prevent="handleSubmit">
                <div class="form-group">
                  <label>Event Title</label>
                  <input v-model="eventForm.title" required type="text" placeholder="e.g. Community Park Cleanup" />
                </div>

                <div class="form-group">
                  <label>Description</label>
                  <textarea v-model="eventForm.description" required rows="3" placeholder="What will volunteers be doing?"></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group half">
                    <label>Date</label>
                    <input v-model="eventForm.date" required type="date" />
                  </div>
                  <div class="form-group half">
                    <label>Time</label>
                    <input v-model="eventForm.time" required type="time" step="60" /> 
                  </div>
                </div>

                <div class="form-row">
                   <div class="form-group half">
                    <label>Category</label>
                    <select v-model="eventForm.category">
                        <option value="Environment">Environment</option>
                        <option value="Social">Social</option>
                        <option value="PublicSafety">Public Safety</option>
                        <option value="Youth">Youth</option>
                        <option value="Arts">Arts</option>
                    </select>
                  </div>
                  <div class="form-group half">
                    <label>Volunteers Needed</label>
                    <input v-model.number="eventForm.volunteersNeeded" type="number" min="1" />
                  </div>
                </div>

                <div class="form-group checkbox-wrapper">
                  <label class="checkbox-label">
                    <input v-model="eventForm.isMicroProject" type="checkbox" />
                    <span class="custom-check"></span>
                    Is this a Micro Project? (Quick task)
                  </label>
                </div>

                <div class="form-group">
                  <label>Supplies Needed</label>
                  <div class="input-group">
                    <input 
                      v-model="suppliesInput" 
                      type="text" 
                      placeholder="e.g. Shovels, Gloves" 
                      @keydown.enter.prevent="handleAddSupply"
                    />
                    <button type="button" @click="handleAddSupply" class="btn btn-secondary">Add</button>
                  </div>
                  
                  <div class="tags-container">
                    <span v-for="(item, idx) in eventForm.suppliesNeeded" :key="idx" class="tag">
                      {{ item }}
                      <button type="button" @click="removeSupply(idx)" class="tag-close">
                        <Icon name="heroicons:x-mark-mini" />
                      </button>
                    </span>
                  </div>
                </div>

                <div v-if="formError" class="error-msg">{{ formError }}</div>

                <div class="form-actions">
                  <button type="submit" :disabled="isSubmitting" class="btn btn-success full-width">
                    {{ isSubmitting ? 'Saving...' : (editingEventId ? 'Update Event' : 'Publish Event') }}
                  </button>
                </div>
              </form>
            </section>
          </transition>

          <div class="events-grid">
            <div v-if="organizationEvents.length === 0" class="no-events">
               <p>No active events. Create one to get started!</p>
            </div>

            <article 
              v-for="event in otherEvents" 
              :key="event.id" 
              class="event-card"
            >
              <div class="card-header">
                <div>
                  <h4>{{ event.title }}</h4>
                  <span class="badge badge-category">{{ event.category }}</span>
                </div>
                <div class="date-badge">
                  <span>{{ event.date }}</span>
                  <small>{{ event.time }}</small>
                </div>
              </div>
              
              <div class="card-body">
                <p class="description-text">{{ event.description }}</p>
                
                <div v-if="event.suppliesNeeded && event.suppliesNeeded.length > 0" class="supplies-row">
                  <span v-for="supply in event.suppliesNeeded" :key="supply" class="supply-badge">
                    <Icon name="heroicons:wrench-screwdriver" class="icon-xs" /> 
                    {{ supply }}
                  </span>
                </div>

                <div class="progress-info">
                  <strong>Volunteers:</strong> {{ event.volunteersSignedUp }} / {{ event.volunteersNeeded }}
                  <div class="progress-bar">
                    <div 
                      class="fill" 
                      :style="{ width: Math.min((event.volunteersSignedUp / event.volunteersNeeded) * 100, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button class="btn btn-sm btn-outline">
                    View Volunteers ({{ event.attendees.length }})
                </button>
                <button @click="startEdit(event)" class="btn btn-sm btn-secondary icon-btn">
                    <Icon name="heroicons:pencil-square" /> Edit
                </button>
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>

    <div v-if="showCheckInModal && selectedEvent" class="modal-backdrop" @click.self="closeCheckInModal">
      <div class="modal-content">
        <header class="modal-header">
          <div>
            <h3>{{ selectedEvent.title }}</h3>
            <p class="subtitle">Check-In Manager</p>
          </div>
          <button class="close-btn" @click="closeCheckInModal">
             <Icon name="heroicons:x-mark" size="24" />
          </button>
        </header>

        <div class="modal-body">
          <div class="attendance-stats">
            <div class="stat-box">
               <span class="stat-num">{{ getAttendeesByStatus('checked-in').length }}</span>
               <span class="stat-label">On Site</span>
            </div>
            <div class="stat-box">
               <span class="stat-num">{{ getAttendeesByStatus('completed').length }}</span>
               <span class="stat-label">Verified</span>
            </div>
            <div class="stat-box">
               <span class="stat-num">{{ mockVolunteers.length }}</span>
               <span class="stat-label">Total</span>
            </div>
          </div>

          <div class="search-wrapper">
            <div class="input-with-icon">
                <Icon name="heroicons:magnifying-glass" class="search-icon" />
                <input type="text" placeholder="Search volunteer name..." class="search-bar pl-10" />
            </div>
          </div>

          <ul class="volunteer-list">
            <li v-for="volunteer in mockVolunteers" :key="volunteer.uid" class="volunteer-row">
              <div class="volunteer-info">
                <strong>{{ volunteer.name }}</strong>
                <span :class="['status-dot', volunteer.status]"></span>
                <span class="status-text">{{ formatStatus(volunteer.status) }}</span>
              </div>
              
              <div class="volunteer-actions">
                <button 
                  v-if="volunteer.status === 'registered'" 
                  @click="updateStatus(volunteer, 'checked-in')"
                  class="btn btn-sm btn-success icon-btn"
                >
                  <Icon name="heroicons:clipboard-document-check" /> Check In
                </button>

                <button 
                  v-if="volunteer.status === 'checked-in'" 
                  @click="handleCheckOut(volunteer)"
                  class="btn btn-sm btn-warning icon-btn"
                >
                  <Icon name="heroicons:arrow-right-on-rectangle" /> Check Out
                </button>

                <span v-if="volunteer.status === 'completed'" class="verified-badge">
                  <Icon name="heroicons:check-badge" /> Verified
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'

// --- Stores ---
import { useAuthStore } from '~~/stores/auth'
import { useOrgStore } from '~~/stores/orgs'
import { useEventsStore } from '~~/stores/events'

// --- Types ---
import type { ConnectEvent } from '~~/types/event'

// 1. Store Initialization
const authStore = useAuthStore()
const orgStore = useOrgStore()
const eventStore = useEventsStore()

// 2. Store State
const { profile, isAuthInitialized, isOrgAdmin } = storeToRefs(authStore)
const { ownedOrganization, isLoading: orgIsLoading, error: orgError } = storeToRefs(orgStore)
const { organizationEvents, isLoading: eventIsLoading, error: eventError } = storeToRefs(eventStore)

// 3. Component State
const showCreateForm = ref(false)
const editingEventId = ref<string | null>(null)
const showCheckInModal = ref(false)
const isSubmitting = ref(false)
const suppliesInput = ref('')
const formError = ref<string | null>(null)
const selectedEvent = ref<ConnectEvent | null>(null)

// --- Mock Data ---
const mockVolunteers = ref([
  { uid: '1', name: 'Alice Walker', status: 'registered' },
  { uid: '2', name: 'Bob Smith', status: 'checked-in' },
  { uid: '3', name: 'Charlie Day', status: 'completed' },
  { uid: '4', name: 'Dana Scully', status: 'registered' },
])

// --- Types for Form ---
type EventFormState = Omit<ConnectEvent, 'id' | 'organizationId' | 'organizationName' | 'volunteersSignedUp' | 'attendees'>

const INITIAL_FORM_STATE: EventFormState = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: { lat: 38.8339, lng: -104.8214 },
  category: 'Social',
  volunteersNeeded: 5,
  isMicroProject: false,
  suppliesNeeded: [],
}

const eventForm = reactive<EventFormState>({ ...INITIAL_FORM_STATE })

// 4. Computed Properties

const todaysEvents = computed(() => {
  if (!organizationEvents.value) return []
  return organizationEvents.value.slice(0, 1) 
})

const otherEvents = computed(() => {
   if (!organizationEvents.value) return []
   return organizationEvents.value.slice(1) 
})

// 5. Actions

async function loadDashboardData() {
  if (!profile.value?.organizationId) return
  await orgStore.fetchOwnedOrganizations(profile.value.organizationId)
  if (ownedOrganization.value) {
    await eventStore.fetchOrganizationEvents(ownedOrganization.value.id)
  }
}

// Modal Logic
function openCheckInModal(event: ConnectEvent) {
  selectedEvent.value = event
  showCheckInModal.value = true
}

function closeCheckInModal() {
  showCheckInModal.value = false
  selectedEvent.value = null
}

function getAttendeesByStatus(status: string) {
  return mockVolunteers.value.filter(v => v.status === status)
}

function formatStatus(status: string) {
  if (status === 'checked-in') return 'Checked In'
  if (status === 'completed') return 'Completed'
  return 'Registered'
}

// Check-In Logic
function updateStatus(volunteer: any, newStatus: string) {
  volunteer.status = newStatus
  if (volunteer.status === 'checked-in') {
    eventStore.checkInVolunteer(selectedEvent.value!.id, volunteer.uid);
  } 
}

function handleCheckOut(volunteer: any) {
  if(confirm(`Finish volunteering for ${volunteer.name}? This will send them a verification email.`)) {
    updateStatus(volunteer, 'completed')
    eventStore.checkOutVolunteer(selectedEvent.value!.id, volunteer.uid);
    eventStore.generateVerificationLetter(selectedEvent.value!.id, volunteer.uid);
  }
}

// --- FORM LOGIC ---

function handleAddSupply() {
  const val = suppliesInput.value.trim()
  if (val) {
    eventForm.suppliesNeeded.push(val)
    suppliesInput.value = ''
  }
}

function removeSupply(index: number) {
  eventForm.suppliesNeeded.splice(index, 1)
}

function resetForm() {
  Object.assign(eventForm, INITIAL_FORM_STATE)
  eventForm.suppliesNeeded = [] 
  editingEventId.value = null 
}

function toggleForm() {
  if (showCreateForm.value) {
    resetForm(); 
  }
  showCreateForm.value = !showCreateForm.value;
}

function startEdit(event: ConnectEvent) {
  Object.assign(eventForm, {
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: { ...event.location },
    category: event.category,
    volunteersNeeded: event.volunteersNeeded,
    isMicroProject: event.isMicroProject,
    suppliesNeeded: [...event.suppliesNeeded],
  })
  
  editingEventId.value = event.id
  showCreateForm.value = true
  
  window.scrollTo({ top: 100, behavior: 'smooth' })
}

async function handleSubmit() {
  if (editingEventId.value) {
    await handleUpdateEvent()
  } else {
    await handleCreateEvent()
  }
}

async function handleCreateEvent() {
  if (!ownedOrganization.value) return
  isSubmitting.value = true
  formError.value = null

  try {
    const payload: Omit<ConnectEvent, 'id'> = {
      ...eventForm,
      organizationId: ownedOrganization.value.id,
      organizationName: ownedOrganization.value.name,
      volunteersSignedUp: 0,
      attendees: [],
    }
    await eventStore.createEvent(payload)
    showCreateForm.value = false
    resetForm()
    alert('Event Created Successfully!')
  } catch (e: any) {
    console.error(e)
    formError.value = e.message || 'Failed to post event.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleUpdateEvent() {
  if (!editingEventId.value) return
  isSubmitting.value = true
  formError.value = null

  try {
    const payload = {
      ...eventForm,
      id: editingEventId.value
    }
    await eventStore.updateEvent(payload)
    showCreateForm.value = false
    resetForm()
    alert('Event Updated Successfully!')
  } catch (e: any) {
    console.error(e)
    formError.value = e.message || 'Failed to update event.'
  } finally {
    isSubmitting.value = false
  }
}

watch(profile, (newProfile) => { if (newProfile) loadDashboardData() }, { immediate: true })
</script>

<style scoped>
/* CSS Variables Wrapper */
.dashboard-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--color-text-main);
}

/* Icon Utilities */
.icon-sm { width: 1.1em; height: 1.1em; vertical-align: text-bottom; margin-right: 4px; display: inline-block; }
.icon-xs { width: 0.9em; height: 0.9em; vertical-align: middle; margin-right: 2px; }
.icon-btn { display: inline-flex; align-items: center; gap: 6px; justify-content: center; }

.pulse-icon { color: var(--color-success); animation: pulse 2s infinite; }
.spin { animation: spin 1s linear infinite; }

/* --- Active Events / Live Manager --- */
.active-events-section {
  background: #f0fdf4; 
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 40px;
  animation: slideDown 0.4s ease-out;
}

.section-header h3 {
  margin: 0;
  color: #15803d; 
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header p {
  margin: 5px 0 15px;
  color: #166534;
  font-size: 0.9rem;
}

.live-card {
  background: white;
  border: 1px solid #dcfce7;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.live-info h4 { margin: 0 0 8px 0; font-size: 1.25rem; }
.live-meta { display: flex; gap: 15px; font-size: 0.9rem; color: var(--color-text-muted); }

.btn-large {
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
}

/* --- Standard Layout --- */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;
}

h1 { font-size: 2rem; margin: 0; color: var(--color-text-main); }
.subtitle { color: var(--color-text-muted); margin: 5px 0 0; }

.org-banner {
  background: var(--color-bg-light);
  padding: 20px;
  border-radius: 8px;
  border-left: 5px solid var(--color-primary);
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}
.org-banner h2 { margin: 0; font-size: 1.5rem; }

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* --- Forms --- */
.form-panel {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.form-title { margin-top: 0; margin-bottom: 20px; }

.form-group { margin-bottom: 1.5rem; }
.form-row { display: flex; gap: 20px; }
.half { flex: 1; }

label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: #475569; }

input, textarea, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-group { display: flex; gap: 10px; }
.tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }

.tag {
  background: var(--color-bg-light);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tag-close { background: none; border: none; cursor: pointer; color: var(--color-text-muted); padding: 0; display: flex; align-items: center; }
.tag-close:hover { color: #ef4444; }

.checkbox-wrapper { display: flex; align-items: center; margin-top: 10px; }
.checkbox-label { display: flex; align-items: center; cursor: pointer; gap: 10px; }

/* --- Event Cards --- */
.events-grid { display: flex; flex-direction: column; gap: 20px; }

.event-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.event-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }

.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
.card-header h4 { margin: 0 0 5px; font-size: 1.2rem; }

.date-badge { text-align: right; color: var(--color-text-muted); font-size: 0.9rem; }
.date-badge span { display: block; font-weight: 600; color: var(--color-text-main); }

.description-text { color: var(--color-text-muted); margin-bottom: 15px; }

/* Supplies Tags in Card */
.supplies-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 15px;
}

.supply-badge {
  background: var(--color-bg-light);
  color: var(--color-text-muted);
  font-size: 0.8rem;
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.progress-info { margin-top: 15px; font-size: 0.9rem; }
.progress-bar {
  height: 6px; background: var(--color-bg-light); border-radius: 3px; margin-top: 5px; overflow: hidden;
}
.fill { height: 100%; background: var(--color-secondary); transition: width 0.3s ease; }

.card-footer {
  margin-top: 20px; border-top: 1px solid var(--color-bg-light); padding-top: 15px;
  display: flex; gap: 10px;
}

/* --- Modal Styles --- */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 600px;
  border-radius: 12px;
  overflow: hidden;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px 24px;
  background: var(--color-bg-light);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 { margin: 0; font-size: 1.25rem; }
.close-btn { background: none; border: none; cursor: pointer; color: var(--color-text-muted); padding: 5px; transition: color 0.2s; }
.close-btn:hover { color: var(--color-text-main); }

.modal-body { padding: 24px; overflow-y: auto; }

.attendance-stats {
  display: flex; gap: 12px; margin-bottom: 24px;
}
.stat-box {
  flex: 1;
  background: var(--color-bg-light);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}
.stat-num { display: block; font-size: 1.5rem; font-weight: 700; color: var(--color-primary); }
.stat-label { font-size: 0.8rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.5px; }

.search-wrapper { margin-bottom: 15px; }
.input-with-icon { position: relative; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); width: 18px; }
.pl-10 { padding-left: 36px !important; }

.volunteer-list { list-style: none; padding: 0; margin: 0; }
.volunteer-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; border-bottom: 1px solid var(--color-border);
}
.volunteer-row:last-child { border-bottom: none; }

.volunteer-info { display: flex; align-items: center; gap: 10px; }

/* Status Dots */
.status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.status-dot.registered { background: #cbd5e1; }
.status-dot.checked-in { background: var(--color-secondary); box-shadow: 0 0 0 2px #6dba89; }
.status-dot.completed { background: var(--color-primary); }
.status-text { font-size: 0.9rem; color: var(--color-text-muted); }

.volunteer-actions { display: flex; align-items: center; gap: 10px; }

.verified-badge {
  color: var(--color-primary); font-weight: 600; font-size: 0.9rem;
  background: #eff6ff; padding: 4px 8px; border-radius: 4px;
  display: inline-flex; align-items: center; gap: 4px;
}

/* --- Buttons & Utilities --- */
.btn {
  padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer;
  border: none; font-size: 0.95rem; transition: all 0.2s;
}
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
.full-width { width: 100%; }

.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover { background: var(--color-primary-dark); }

.btn-secondary { background: var(--color-border); color: #475569; }
.btn-secondary:hover { background: #cbd5e1; }

.btn-outline { background: transparent; border: 1px solid var(--color-border); color: #475569; }
.btn-outline:hover { border-color: #94a3b8; color: var(--color-text-main); }

.btn-success { background: var(--color-secondary); color: white; }
.btn-success:hover { background: var(--color-secondary-dark); }

.btn-warning { background: var(--color-accent); color: white; }
.btn-warning:hover { background: #d97706; }

.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
.badge-admin { background: #dbeafe; color: #1e40af; }
.badge-category { background: #f3e8ff; color: #7e22ce; }

/* Alerts */
.alert { padding: 15px; border-radius: 6px; margin-bottom: 20px; }
.alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.error-msg { color: #dc2626; font-size: 0.9rem; margin-top: 10px; }

/* Animations */
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } 
}.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.pulse {
  color: var(--color-secondary); /* or #22c55e */
  animation: pulse 2s infinite;
  margin-left: 8px; /* Adds a little space between text and dot */
  font-size: 1.2rem; /* Adjust size of the dot */
}
</style>