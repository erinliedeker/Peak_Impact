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
      :disabled="buttonState.disabled"
    >
      {{ buttonState.text }}
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
import { computed } from 'vue';
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

// Computed property to handle button state
const buttonState = computed(() => {
  if (!auth.isAuthInitialized) return { disabled: true, text: 'Loading...' }; // ⏳ Wait for Auth
  if (isSigningUp.value)       return { disabled: true, text: 'Processing...' };
  if (isAlreadySignedUp.value) return { disabled: true, text: 'Signed Up ✅' };
  return { disabled: false, text: 'Sign Up' };
});

async function handleSignUp() {
  if (props.item.isExternal) {
    window.open(props.item.externalUrl, '_blank');
    return;
  }

  // Double check auth
  if (!auth.profile) {
    alert("Please log in to sign up.");
    return;
  }

  isSigningUp.value = true;
  
  try {
    // USE A PLAIN OBJECT HERE
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