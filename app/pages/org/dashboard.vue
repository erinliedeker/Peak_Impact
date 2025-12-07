<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useAuthStore } from '~~/stores/auth';
import { useOrgStore } from '~~/stores/orgs';
import { useEventsStore } from '~~/stores/events'; // NEW IMPORT
import { storeToRefs } from 'pinia';
import type { ConnectEvent } from '~~/types/event';

// 1. Initialize Stores
const authStore = useAuthStore();
const orgStore = useOrgStore();
const eventStore = useEventsStore(); // NEW

// 2. State & Refs
const { profile, isAuthInitialized, isOrgAdmin } = storeToRefs(authStore);
const { ownedOrganization, isLoading, error } = storeToRefs(orgStore);
const { organizationEvents, isLoading: eventIsLoading, error: eventError } = storeToRefs(eventStore);

const showCreateForm = ref(false);
const isSubmitting = ref(false);
const formError = ref<string | null>(null);

// 3. Form Data (Default State)
const eventForm = reactive<Omit<ConnectEvent, 'id' | 'organizationId' | 'organizationName' | 'volunteersSignedUp' | 'attendees'>>({
  title: '',
  description: '',
  date: '',
  time: '',
  location: { lat: 38.8339, lng: -104.8214 }, // Default: Colorado Springs
  category: 'Social',
  volunteersNeeded: 5,
  isMicroProject: false,
  suppliesNeeded: [],
});

const suppliesInput = ref(''); // Temp holder for adding supplies

// 4. Methods

const loadOrgData = async () => {
  if (profile.value && profile.value.organizationId) { 
    // 1. Fetch the owned organization
    await orgStore.fetchOwnedOrganizations(profile.value.organizationId);

    // 2. If successful, fetch the associated events
    if (ownedOrganization.value) {
        await eventStore.fetchOrganizationEvents(ownedOrganization.value.id);
    }
  }
};

const handleAddSupply = () => {
  if (suppliesInput.value.trim()) {
    eventForm.suppliesNeeded.push(suppliesInput.value.trim());
    suppliesInput.value = '';
  }
};

const handleCreateEvent = async () => {
  if (!ownedOrganization.value) return;

  isSubmitting.value = true;
  formError.value = null;

  try {
    // Construct the full payload
    // We explicitly set the "Managed" fields here
    const payload = {
      ...eventForm,
      organizationId: ownedOrganization.value.id,
      organizationName: ownedOrganization.value.name,
      volunteersSignedUp: 0,
      attendees: [], // Start with empty array
    };

    await eventStore.createEvent(payload);
    
    // Success: Close form and reset
    showCreateForm.value = false;
    alert("Event Created Successfully!");
    
    // Reset basic fields
    eventForm.title = '';
    eventForm.description = '';
    eventForm.suppliesNeeded = [];
    
  } catch (e: any) {
    formError.value = e.message || "Failed to post event.";
  } finally {
    isSubmitting.value = false;
  }
};

// Watchers
watch(profile, (newProfile) => {
  if (newProfile) loadOrgData();
}, { immediate: true });
</script>
<template>
  <div>
    <h1>Organization Dashboard</h1>

    <div v-if="!isAuthInitialized">Checking auth...</div>
    <div v-else-if="authStore.isLoggedIn && !isOrgAdmin">
      <h3>Access Denied</h3>
      <p>You are logged in as a <strong>{{ profile?.userType }}</strong>.</p>
    </div>

    <div v-else-if="authStore.isLoggedIn">
      
      <div style="display:flex; justify-content:space-between; align-items:center;">
         <p>Welcome, {{ authStore.userName }}</p>
         <button @click="loadOrgData" :disabled="isLoading">Refresh</button>
      </div>
      <hr />

      <div v-if="isLoading">Loading organization and events...</div>
      <div v-else-if="error || orgError || eventError" style="color: red;">
        Error: {{ error || orgError || eventError }}
      </div>

      <div v-else>
        
        <div v-if="!ownedOrganization">
           <p>You have no organization. Create one first.</p>
           <button>Create Organization</button>
        </div>

        <div v-else>
          <h2>{{ ownedOrganization.name }}</h2>
          <p>Admin Dashboard</p>

          <div style="margin: 20px 0;">
            <button @click="showCreateForm = !showCreateForm" :disabled="isLoading">
              {{ showCreateForm ? 'Cancel Event' : '+ Post New Event' }}
            </button>
          </div>

          <div v-if="showCreateForm" style="border: 1px solid #ccc; padding: 20px; background: #f9f9f9;">
            <h3>Create New Event</h3>
            
            <form @submit.prevent="handleCreateEvent">
              
              <div style="margin-bottom: 10px;">
                <label>Event Title:</label><br/>
                <input v-model="eventForm.title" required type="text" placeholder="e.g. Park Cleanup" style="width: 100%;" />
              </div>

              <div style="margin-bottom: 10px;">
                <label>Description:</label><br/>
                <textarea v-model="eventForm.description" required rows="3" style="width: 100%;"></textarea>
              </div>

              <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <div>
                    <label>Date:</label><br/>
                    <input v-model="eventForm.date" required type="date" />
                </div>
                <div>
                    <label>Time (HH:MM):</label><br/>
                    <input v-model="eventForm.time" required type="time" step="60" /> 
                </div>
                <div>
                    <label>Category:</label><br/>
                    <select v-model="eventForm.category">
                        <option value="Environment">Environment</option>
                        <option value="Social">Social</option>
                        <option value="PublicSafety">Public Safety</option>
                        <option value="Youth">Youth</option>
                        <option value="Arts">Arts</option>
                    </select>
                </div>
              </div>

              <div style="margin-bottom: 10px;">
                <label>Volunteers Needed:</label>
                <input v-model.number="eventForm.volunteersNeeded" type="number" min="1" />
                
                <label style="margin-left: 15px;">Micro Project?</label>
                <input v-model="eventForm.isMicroProject" type="checkbox" />
              </div>

              <div style="margin-bottom: 10px;">
                <label>Supplies Needed:</label><br/>
                <div style="display:flex; gap: 5px;">
                    <input v-model="suppliesInput" type="text" placeholder="e.g. Shovels" />
                    <button type="button" @click="handleAddSupply">Add</button>
                </div>
                <ul>
                    <li v-for="(item, idx) in eventForm.suppliesNeeded" :key="idx" 
                        style="display: inline-block; background: #ddd; padding: 2px 5px; margin-right: 5px;">
                        {{ item }}
                    </li>
                </ul>
              </div>

              <div v-if="formError" style="color:red; margin-bottom: 10px;">{{ formError }}</div>

              <button type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Posting...' : 'Publish Event' }}
              </button>
            </form>
          </div>
          <hr />
          
          <h3>Upcoming Events ({{ organizationEvents.length }})</h3>

          <div v-if="organizationEvents.length === 0">
             <p>No upcoming events posted. Start by creating one above!</p>
          </div>
          <ul v-else style="list-style-type: none; padding: 0;">
            <li v-for="event in organizationEvents" :key="event.id" 
                style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px;">
                
                <h4>{{ event.title }} ({{ event.category }})</h4>
                <p><strong>Date/Time:</strong> {{ event.date }} @ {{ event.time }}</p>
                <p><strong>Volunteers:</strong> {{ event.volunteersSignedUp }} / {{ event.volunteersNeeded }}</p>
                <p>{{ event.description }}</p>
                
                <button>View Volunteers ({{ event.attendees.length }})</button>
                <button style="margin-left: 10px;">Edit Event</button>
            </li>
          </ul>

        </div>
      </div>
    </div>
    
    <div v-else>Please Login.</div>
  </div>
</template>