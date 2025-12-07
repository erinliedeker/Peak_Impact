<template>
  <div v-if="item != null" class="event-card">
    
    <header class="event-header">
      <div class="organizer-info">
        <img class="organizer-avatar" 
          src='~/assets/images/avatar-placeholder.png'
          :alt="`Avatar for ${item.organizationName}`"  
        />
        <a v-if="item.isExternal" class="organizer-name" :href="item.externalUrl" target="_blank">{{ item.organizationName}}</a>
        <span v-else class="organizer-name">{{ item.organizationName}}</span>
      </div>
      
      <h1>{{ item.title }}</h1>

      <div class="time-block">
        <div class="date-display">
            <UIcon name="i-lucide-calendar" class="detail-icon" />
            <span>{{ formatDate(item.date) }}</span>
        </div>
        <div class="time-display">
            <UIcon name="i-lucide-clock" class="detail-icon" />
            <span>{{ formatTime(item.start) }} - {{ formatTime(item.end) }} ({{ getTimezone(item.date) }})</span>
        </div>
      </div>

    </header>
    
    <div class="action-buttons">
      <a v-if="item.isExternal" class="btn primary" :href="item.externalUrl" target="_blank">Sign Up
        <UIcon name="i-lucide-arrow-up-right" size="1rem" />
      </a>
      <button 
        v-else 
        class="btn primary" 
        @click="handleSignUp"
        :disabled="buttonState.disabled"
      >
        {{ buttonState.text }}
      </button>

      <button class="btn secondary">Share</button>
    </div>

    <div class="details-section">
      <h2>Event Details</h2>
      <ul class="detail-list">
        <li>
          <UIcon name="i-lucide-tag" class="detail-icon" />
          <strong>Category:</strong> 
          <span>{{ item.category }}</span>
        </li>
        <li>
          <UIcon name="i-lucide-users" class="detail-icon" />
          <strong>Volunteers:</strong> 
          <span :class="{'full': isEventFull}">{{ item.volunteersSignedUp }} / {{ item.volunteersNeeded }}</span>
        </li>
      </ul>
      
      <h2 class="section-title">Description</h2>
      <p v-if="item.description">{{ item.description }}</p>
      <p v-else class="placeholder-text">No description available for this event.</p>
    </div>

    <div class="organizer-details-section">
      <h2 class="section-title">About {{ item.organizationName}}</h2>
      <p v-if="item.organizationDescription">{{ item.organizationDescription }}</p>
      <p v-else class="placeholder-text">No organization description available.</p>
    </div>
  </div>
  <div v-else class="event-card no-event-selected">
    <p>Please select an event from the list.</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '~~/stores/auth';
import { useEventsStore } from '~~/stores/events';

const props = defineProps({ item: { type: Object, required: true } })
const eventsStore = useEventsStore();
const auth = useAuthStore();
const isSigningUp = ref(false);

// ---------------------------------------------------------

const isAlreadySignedUp = computed(() => {
  if (!props.item.attendees || !auth.profile) return false;
  return props.item.attendees.some(a => a.volunteerId === auth.profile?.id);
});

const isEventFull = computed(() => {
  return props.item.volunteersSignedUp >= props.item.volunteersNeeded;
});

// Computed property to handle button state
const buttonState = computed(() => {
  if (!auth.isAuthInitialized) return { disabled: true, text: 'Loading...' }; 
  if (isSigningUp.value)       return { disabled: true, text: 'Processing...' };
  if (isAlreadySignedUp.value) return { disabled: true, text: 'Signed Up' };
  if (isEventFull.value)       return { disabled: true, text: 'Event Full' };
  return { disabled: false, text: 'Sign Up' };
});

// --- Formatting Helpers ---

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function formatTime(timeString) {
    if (!timeString) return 'TBD';
    // Assumes timeString is an ISO-like time string (e.g., "10:00:00")
    // Use an arbitrary date to parse the time, then format it.
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
}

function getTimezone(dateString) {
    // Tries to grab the short timezone name, e.g., "MST"
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-us', { timeZoneName:'short'}).split(' ')[2];
    } catch {
        return 'Local Time';
    }
}

// --- Action Handler ---

async function handleSignUp() {
  if (props.item.isExternal) {
    window.open(props.item.externalUrl, '_blank');
    return;
  }

  if (!auth.profile) {
    alert("Please log in to sign up.");
    return;
  }

  isSigningUp.value = true;
  
  try {
    const volunteerPayload = {
      volunteerId: auth.profile.id,
      name: auth.profile.name,
      email: auth.profile.email,
      checkInTime: null,
      checkOutTime: null,
      hoursVerified: false,
      verificationLetterSent: false
    };

    await eventsStore.signUpVolunteer(props.item.id, volunteerPayload);
    
  } catch (error) {
    console.error("Error signing up:", error);
    alert("Failed to sign up.");
  } finally {
    isSigningUp.value = false;
  }
}
</script>
<style scoped>
.event-card { 
  display: flex;
  flex-direction: column;
  flex-grow: 1; 
  align-items: stretch;
  
  /* Layout adjustments for spacing and width */
  max-width: 750px; /* Limits the content width */
  margin: 0 auto;  /* Centers the card within its container */
  padding: 3rem 2.5rem; /* Increased vertical and horizontal padding */
  
  background: #fff; 
  height: 100%;
  overflow-y: auto;
}

.no-event-selected {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #6B7280;
    font-size: 1.1rem;
}

/* --- Organizer Info --- */

.organizer-info {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem; /* Increased margin */
}
.organizer-avatar {
  width: 48px; 
  height: 48px;
  border-radius: 50%;
  margin-right: 16px; /* Increased margin */
  object-fit: cover;
  border: 1px solid #E5E7EB;
}
.organizer-name {
  font-weight: 600;
  color: #4B5563; 
  font-size: 1.05rem; /* Slightly larger text */
  text-decoration: none;
}
.organizer-name:hover {
  text-decoration: underline;
}

/* --- Header & Time Block --- */

.event-header {
  border-bottom: 1px solid #E5E7EB; 
  padding-bottom: 2rem; /* Increased spacing below header */
  margin-bottom: 2rem; /* Increased spacing after header */
}
.event-header h1 {
  font-size: 2.25rem; /* Slightly larger title */
  font-weight: 800;
  color: #1F2937;
  line-height: 1.2;
  margin: 0 0 1.25rem 0; /* Increased margin */
}

.time-block {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Increased gap */
  padding: 15px 0; /* Increased vertical padding */
  border-top: 1px solid #F3F4F6;
  border-bottom: 1px solid #F3F4F6;
  font-size: 1.05rem;
  color: #374151;
}

.date-display, .time-display {
    display: flex;
    align-items: center;
    gap: 10px; /* Increased gap */
    font-weight: 500;
}

/* --- Action Buttons --- */

.action-buttons {
  display: flex;
  padding: 1.5rem 0; /* Increased padding */
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 3rem; /* Increased margin below buttons */
}
.btn{
  height: 48px; /* Slightly taller buttons */
  padding: 12px 24px;
  border-radius: 8px;
  margin-right: 16px; /* Increased margin */
  border: none; 
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: background-color 0.15s ease, opacity 0.15s ease;
}

.btn.primary {
  background-color: var(--color-primary, #3B82F6); 
  color: var(--color-white);
}
.btn.primary:hover:not(:disabled) {
  background-color: #2563EB;
}
.btn.secondary {
  background-color: #F9FAFB;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}
.btn.secondary:hover:not(:disabled) {
  background-color: #E5E7EB;
}
.btn:disabled {
  background-color: #D1D5DB;
  color: #9CA3AF;
  cursor: not-allowed;
  opacity: 0.8;
  border-color: #E5E7EB;
}

/* --- Details Sections --- */

.details-section, .organizer-details-section {
    margin-bottom: 3rem; /* Increased section bottom margin */
}

.section-title {
    font-size: 1.35rem; /* Slightly larger title */
    font-weight: 700;
    color: #1F2937;
    margin-bottom: 1.25rem; /* Increased margin */
    padding-bottom: 4px;
    border-bottom: 1px solid #F3F4F6;
}

.details-section p, .organizer-details-section p {
    line-height: 1.7; /* Increased line height for better readability */
    color: #4B5563;
    font-size: 1.05rem;
}

.placeholder-text {
    font-style: italic;
    color: #9CA3AF;
}

.detail-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 15px; /* Increased list item spacing */
}

.detail-list li {
    display: flex;
    align-items: center;
    gap: 12px; /* Increased gap */
    color: #4B5563;
    font-size: 1.05rem;
}

.detail-list li strong {
    font-weight: 600;
    color: #1F2937;
    min-width: 90px;
}

.detail-icon {
    width: 22px; /* Slightly larger icon */
    height: 22px;
    color: var(--color-primary, #3B82F6);
    flex-shrink: 0;
}

.full {
    color: #EF4444; 
    font-weight: 700;
}
</style>