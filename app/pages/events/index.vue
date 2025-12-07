<template>
  <EventSearchBar
    @search="onSearch"
    @update:filters="onFiltersUpdate"
  />
  <EventList 
  :events="filteredEvents" 
  @select="openEvent"
  />

  {{ $route.params.id }}

  <div v-if="loading" class="placeholder-page">Loading events...</div>
</template>

<script setup>
import { ref } from 'vue'
const filters = ref({})
const query = ref('')

function filterEvents({ query: q, filters: f }) {
  const qLower = (q || '').trim().toLowerCase()
  const when = (f?.when) || 'any'
  const category = (f?.category || '').toLowerCase()
  const status = (f?.status || 'all').toLowerCase()
  const today = new Date()

  return allEvents.value.filter(ev => {
    // text match (name or organizer)
    const nameMatch = ev.name && ev.name.toLowerCase().includes(qLower)
    const organizerName = ev.organizer?.name || ''
    const organizerMatch = organizerName.toLowerCase().includes(qLower)
    const textOk = !qLower || nameMatch || organizerMatch

    // category match
    const categoryOk = !category || (ev.category || '').toLowerCase() === category

    // status match
    const statusOk = status === 'all' || (ev.status || '').toLowerCase() === status

    // when match (assumes ev.date is ISO string or Date)
    let whenOk = true
    if (when === 'upcoming' || when === 'past') {
      const evDate = ev.date ? new Date(ev.date) : null
      if (!evDate) whenOk = when === 'past' // unknown dates treated as past-ish
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
  console.log('selected event', ev)
}


// Example fetch — replace with API call
async function fetchEvents() {
  loading.value = true
  try {
    // replace with real fetch
    await new Promise(r => setTimeout(r, 200)) // fake delay
    allEvents.value = [
      { id: 1, name: 'Beach Cleanup', organizer: { name: 'Ocean Org', avatar: '' }, category: 'volunteer', status: 'open', date: '2026-01-12' },
      { id: 2, name: 'Community Fundraiser', organizer: { name: 'Help Together', avatar: '' }, category: 'fundraiser', status: 'open', date: '2025-11-01' },
      { id: 3, name: 'Team Meeting', organizer: { name: 'Peak Impact', avatar: '' }, category: 'meeting', status: 'full', date: '2024-10-10' }
    ]
    // initial display
    displayedEvents.value = allEvents.value
  } finally {
    loading.value = false
  }
}

onMounted(fetchEvents)
</script>

<style scoped>
.placeholder-page {
  text-align: center;
  margin-top: 3rem;
  color: #718096;
}
</style>