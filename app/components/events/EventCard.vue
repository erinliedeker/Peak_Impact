<template>
  <div v-if="item != null" class="event-card">
    <div class="organizer-info">
      <img class="organizer-avatar" 
      src='~/assets/images/avatar-placeholder.png'
      :alt="`Avatar for ${item.organizationName}`"  
      />
      <a v-if="item.isExternal" class="organizer-name" :href=item.externalUrl>{{ item.organizationName}}</a>
      <span v-else class="organizer-name">{{ item.organizationName}}</span>
    </div>
    <header class="event-header">
      <h1>{{ item.title }}</h1>
    </header>
    
    <div class="action-buttons">
      <a v-if="item.isExternal" class="btn primary" :href="item.externalUrl">Sign Up
        <UIcon name="i-lucide-arrow-up-right" size="1rem" />
      </a>
      <button 
        v-else 
        class="btn primary" 
        @click="handleSignUp"
        :disabled="isSigningUp || isAlreadySignedUp"
      >
      Sign Up
      </button>

      <button class="btn secondary">Share</button>
    </div>

    <div class="details">
      <h2>Event Details</h2>
      <p><strong>Date:</strong> {{ new Date(item.date).toLocaleDateString() }}</p>
      <p><strong>Category:</strong> {{ item.category }}</p>
      <p><strong>Volunteers:</strong> {{ item.volunteersSignedUp }} / {{ item.volunteersNeeded }}</p>
      <h2>Description</h2>
      <p v-if="item.description">{{ item.description }}</p>
      <p v-else>No description available.</p>
    </div>
    <div class="organizer-details">
      <h2>About {{ item.organizationName}}</h2>
      <p v-if="item.organizationDescription">{{ item.organizationDescription }}</p>
      <p v-else>No organization description available.</p>
    </div>
  </div>
  <div v-else class="event-card">
    <p>No event selected.</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useEventsStore } from '~~/stores/events'; // Adjust path if needed

const props = defineProps({ item: { type: Object, required: true } })

const eventsStore = useEventsStore();
const isSigningUp = ref(false);

// --- MOCK USER DATA (REPLACE THIS WITH YOUR AUTH STORE) ---
// const authStore = useAuthStore();
// const currentUser = authStore.user;
const currentUser = {
  id: 101, 
  name: "Jane Doe",
  email: "jane@example.com"
};
// ---------------------------------------------------------

// Check if current user is already in the attendees list
const isAlreadySignedUp = computed(() => {
  if (!props.item.attendees) return false;
  return props.item.attendees.some(a => a.volunteerId === currentUser.id);
});

async function handleSignUp() {
  // 1. Handle External Events (Mobilize)
  if (props.item.isExternal) {
    window.open(props.item.externalUrl, '_blank');
    return;
  }

  // 2. Handle Internal Events
  isSigningUp.value = true;
  
  try {
    // Construct the VolunteerAttendance object based on your Types
    const volunteerPayload = {
      volunteerId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      checkInTime: null,
      checkOutTime: null,
      hoursVerified: false,
      verificationLetterSent: false
    };

    // Call the store action
    await eventsStore.signUpVolunteer(props.item.id, volunteerPayload);
    
    // Optional: Show a toast/alert
    console.log("Signup successful!");
    
  } catch (error) {
    console.error("Error signing up:", error);
    alert("Failed to sign up. Please try again.");
  } finally {
    isSigningUp.value = false;
  }
}
</script>

<style scoped>
/* Your existing styles remain unchanged */
.event-card { 
  display: flex;
  flex-direction: column;
  flex-grow: 3;
  align-items: left;
  padding: 2rem 5rem; 
  background: #fff; 
  border-radius: 8px; 
}
.organizer-info {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.organizer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}
.event-header {
  margin-top: 1rem;
  border-bottom: var(--color-border) 1px solid;
}
.action-buttons {
  flex-direction: row;
  padding: .5rem 1rem;
  justify-content: center;
  border-bottom: var(--color-border) 1px solid;
}
.btn{
  height: 40px;
  padding: 8px 16px;
  border-radius: 6px;
  margin-right: 8px;
  border: 1px solid var(--color-border);
  cursor: pointer;
}
/* Add disabled style for visual feedback */
.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  border-color: #bbb;
}
.btn.primary {
  background-color: var(--color-secondary);
  color: var(--color-white);
  border: 1px solid var(--color-border);
}
.btn.primary:hover:not(:disabled) {
  background-color: var(--color-secondary-dark);
}
</style>