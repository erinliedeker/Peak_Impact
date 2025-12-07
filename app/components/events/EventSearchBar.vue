<template>
  <div class="event-search-bar" role="search" aria-label="Event search and filters">
    <form class="search-form" @submit.prevent="doSearch">
      <label class="visually-hidden" for="event-search">Search events</label>
      <input
        id="event-search"
        class="search-input"
        type="search"
        v-model="query"
        placeholder="Search events, organizers, keywords..."
        @input="onInput"
        aria-label="Search events"
      />

      <button type="submit" class="search-btn" aria-label="Search">
        Search
      </button>

      <div class="filters control" ref="filterRoot">
        <button
          type="button"
          class="filters-toggle"
          @click="toggleFilters"
          :aria-expanded="openFilters"
          aria-haspopup="true"
        >
          Filters
        </button>

        <div v-if="openFilters" class="filters-dropdown" role="dialog" aria-label="Event filters">
          <div class="filters-row">
            <label>When</label>
            <select v-model="filters.when">
              <option value="any">Any time</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          <div class="filters-row">
            <label>Category</label>
            <select v-model="filters.category">
              <option value="">All</option>
              <option value="volunteer">Volunteer</option>
              <option value="fundraiser">Fundraiser</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>

          <div class="filters-row">
            <label>Status</label>
            <select v-model="filters.status">
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
            </select>
          </div>

          <div class="filters-actions">
            <button type="button" class="apply-btn" @click="applyFilters">Apply</button>
            <button type="button" class="clear-btn" @click="clearFilters">Clear</button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['search', 'update:filters'])

const query = ref('')
const openFilters = ref(false)
const filters = ref({
  when: 'any',
  category: '',
  status: 'all'
})

function doSearch() {
  emit('update:filters', { ...filters.value })
  emit('search', { query: query.value.trim(), filters: { ...filters.value } })
  openFilters.value = false
}

function applyFilters() {
  doSearch()
}

function clearFilters() {
  filters.value = { when: 'any', category: '', status: 'all' }
  doSearch()
}

function toggleFilters() {
  openFilters.value = !openFilters.value
}

// close dropdown on outside click
const filterRoot = ref(filterRoot)
function onDocClick(e) {
  if (filterRoot.value && !filterRoot.value.contains(e.target)) openFilters.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
.event-search-bar { display: block; padding: 8px 6px; }
.search-form {
  display: flex;
  gap: 8px;
  align-items: center;
}
.search-input {
  flex: 1 1 240px;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.search-btn, .filters-toggle {
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
}
.control { position: relative; }
.filters-dropdown {
  position: absolute;
  right: 0;
  margin-top: 8px;
  width: 280px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 8px 20px rgba(15,23,42,0.08);
  z-index: 40;
}
.filters-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.filters-row label { font-size: 12px; color: #6b7280; }
.filters-row select { padding: 6px 8px; border-radius: 6px; border: 1px solid #e5e7eb; }
.filters-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; }
.apply-btn, .clear-btn { padding: 6px 8px; border-radius: 6px; cursor: pointer; border: none; }
.apply-btn { background: #2563eb; color: #fff; }
.clear-btn { background: transparent; color: #6b7280; border: 1px solid #e5e7eb; }
.visually-hidden { position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px); white-space: nowrap; }
</style>