<template>
  <div class="events-page">
    <div class="search-bar-container">
      <EventSearchBar
        @search="onSearch"
        @update:filters="onFiltersUpdate"
      />
    </div>
    <div class="content-window">
      <div class="event-list-container">
        <EventList 
          class="event-list"
          :events="displayedEvents" 
          :loading="loading" @select="openEvent"
        />
      </div>
      <div class="event-card-container">
        <EventCard class="event-card"
          v-if="selectedEvent"
          :item="selectedEvent"
        />
      </div>
    </div>
  </div>  
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EventSearchBar from '@/components/events/EventSearchBar.vue'
import EventList from '@/components/events/EventList.vue'
import EventCard from '@/components/events/EventCard.vue'
import { useEventsStore } from '../stores/events.ts'

const router = useRouter()
const filters = ref({})
const query = ref('')

const allEvents = ref([])
const displayedEvents = ref([])
const selectedEvent = ref(null)
const loading = ref(false)


function filterEvents({ query: q, filters: f }) {
  const qLower = (q || '').trim().toLowerCase()
  const when = (f?.when) || 'any'
  const category = (f?.category || '').toLowerCase()
  
  const today = new Date()

  return allEvents.value.filter(ev => {
    // 1. FIX: Use 'title' instead of 'name'
    const nameMatch = ev.title && ev.title.toLowerCase().includes(qLower)
    
    // 2. FIX: Use 'organizationName' directly (no nested organizer object)
    const organizerName = ev.organizationName || ''
    const organizerMatch = organizerName.toLowerCase().includes(qLower)
    
    const textOk = !qLower || nameMatch || organizerMatch

    // 3. Category match
    const categoryOk = !category || (ev.category || '').toLowerCase() === category

    // 4. Status match (simplified since 'status' isn't in your interface yet)
    // You might want to remove this if you don't have a status filter on the UI yet
    let status = '';
    if(ev.volunteersNeeded > ev.volunteersSignedUp) {
      status = 'open';
    } else {
      status = 'full';
    }
    const statusOk = status === f?.status.toLowerCase() || f?.status === 'all' || !f?.status;

    // 5. When match
    let whenOk = true
    if (when === 'upcoming' || when === 'past') {
      const evDate = ev.date ? new Date(ev.date) : null
      if (!evDate) whenOk = when === 'past' 
      else whenOk = when === 'upcoming' ? evDate >= today : evDate < today
    }

    return textOk && categoryOk && statusOk && whenOk
  })
}

function onSearch(payload) {
  // payload = { query: '...', filters: { ... } }
  query.value = payload.query
  filters.value = { ...payload.filters }
  displayedEvents.value = filterEvents(payload)
}

function onFiltersUpdate(newFilters) {
  filters.value = { ...newFilters }
  displayedEvents.value = filterEvents({ query: query.value, filters: filters.value })
}

function openEvent(ev) {
  // navigate or open detail — implement as needed
  selectedEvent.value = ev
}


async function fetchEvents() {
  loading.value = true
  try {
   allEvents.value = await useEventsStore().fetchEvents()
   displayedEvents.value = allEvents.value
   if(!selectedEvent.value) {
    openEvent(allEvents.value[0])
   }

  } finally {
    loading.value = false
  }
}

onMounted(fetchEvents)
</script>

<style scoped>

.events-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

}

.search-bar-container {
  min-height: 50px;
  background-color: var(--color-bg);
}

.content-window {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 50px);
  overflow: clip;
}

.event-list-container {
  width: 40%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: auto;
  box-sizing: border-box;
}

.event-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

.event-card-container {
  width:60%;
  border-left: 1px solid var(--color-border);
  background-color: var(--color-light-bg);
}

.event-card {
  width: auto;
  height: 100%;
  overflow-y: auto;
}

.placeholder-page {
  text-align: center;
  margin-top: 3rem;
  color: #718096;
}
</style>