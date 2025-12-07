<template>
  <section class="my-events-page">
    <div class="content-window">
      <div class="calendar">
        <div class="nav">
          <button class="nav-btn" @click="prevMonth">‹</button>
          <h2 class="month-label">{{ monthLabel }}</h2>
          <button class="nav-btn" @click="nextMonth">›</button>
        </div>
        <div class="calendar-grid">
          <div class="week-head">
            <div v-for="d in weekDays" :key="d" class="week-day">{{ d }}</div>
          </div>

          <div class="days-grid">
            <div
              v-for="cell in cells"
              :key="cell.key"
              :class="['day-cell', { 'outside': !cell.inMonth }]"
            >
              <div class="day-num">{{ cell.date.getDate() }}</div>

              <ul class="day-events" role="list">
                <li
                  v-for="ev in eventsForDay(cell.date)"
                  :key="ev.id"
                  class="event-pill"
                  @click="openEvent(ev)"
                >
                  {{ ev.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

     <aside class="detail-panel" role="dialog" aria-label="Event details">
        <div v-if="selectedEvent">
          <h2>{{ selectedEvent.name }}</h2>
          <div class="meta">
            <div>When: {{ formatDate(selectedEvent.date) }}</div>
            <div>Location: {{ selectedEvent.location || '—' }}</div>
          </div>
          <p v-if="selectedEvent.description">{{ selectedEvent.description }}</p>
          <div class="actions">
            <button @click="goToEventPage(selectedEvent)">View page</button>
          </div>
        </div>

        <div v-else class="empty-panel">
          <h3>No event selected</h3>
          <p>Select an event from the calendar to view details.</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockEvents, mockOrgs } from '../server/utils/reports/mockData.ts' // mock data for demo

const today = new Date()
const activeYear = ref(today.getFullYear())
const activeMonth = ref(today.getMonth()) // 0 = Jan

const selectedEvent = ref(null)

// week day labels (Sunday-first)
const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// build 6x7 calendar cells for the active month
const cells = computed(() => {
  const year = activeYear.value
  const month = activeMonth.value
  const firstOfMonth = new Date(year, month, 1)
  const startDay = firstOfMonth.getDay() // 0..6
  const startDate = new Date(year, month, 1 - startDay) // date of first cell

  const out = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    out.push({
      key: d.toISOString(),
      date: d,
      inMonth: d.getMonth() === month
    })
  }
  return out
})

// normalize mock events into UI-friendly shape
const allEvents = ref([])

onMounted(() => {
  // map mock events (they use Date objects)
  allEvents.value = mockEvents.map(ev => ({
    id: ev.id,
    name: ev.name,
    date: ev.date instanceof Date ? ev.date.toISOString() : String(ev.date),
    location: ev.location || '',
    organizerName: mockOrgs[ev.org]?.name || '',
    description: ev.description || ''
  }))
})

// return events that fall on the same local day
function eventsForDay(date) {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0,10)
  return allEvents.value.filter(ev => {
    const d = new Date(ev.date)
    return d.toISOString().slice(0,10) === target
  })
}

const monthLabel = computed(() => {
  const d = new Date(activeYear.value, activeMonth.value, 1)
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
})

function prevMonth() {
  if (activeMonth.value === 0) {
    activeMonth.value = 11
    activeYear.value--
  } else {
    activeMonth.value--
  }
}

function nextMonth() {
  if (activeMonth.value === 11) {
    activeMonth.value = 0
    activeYear.value++
  } else {
    activeMonth.value++
  }
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

function openEvent(ev) {
  selectedEvent.value = ev
}

function goToEventPage(ev) {
  // navigate to event page if you have router setup (optional)
  // import { useRouter } from 'vue-router' above and call router.push(`/events/${ev.id}`)
  selectedEvent.value = null
}
</script>

<style scoped>
.my-events-page {
  display: flex;
  flex-direction: column;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  height: 100%;
  box-sizing: border-box;
  align-items: center;
  overflow: clip;

}

/* header */
.page-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.page-header h1 { margin: 0; font-size: 1.25rem; }

.content-window {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.nav {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  align-items: center;
  margin-bottom: 2rem;
}

.month-label {
  font-weight: bold;
}

/* calendar */
.calendar { 
  display: flex;
  flex-direction: column;
  background: var(--color-white); 
  padding: 12px; 
  box-sizing: border-box; 
  height: 100%; 
  width: 60%;
  overflow: auto; 
  justify-content: top;
  align-items: center;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.week-head { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 6px; }
.week-day { text-align: center; font-weight: 600; color: #6b7280; font-size: 12px; }

.days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.day-cell {
  min-height: 96px;
  background: #fafafa;
  padding: 8px;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.day-cell.outside { opacity: 0.45; background: #fff; }

.day-num { font-weight: 700; font-size: 13px; color: #111827; }

/* events list in day */
.day-events { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
.event-pill {
  background: #2563eb;
  color: white;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* detail panel */
.detail-panel {
  background: white;
  border-left: 1px solid var(--color-border);
  padding: 12px;
  position: relative;
  height: 100%;
  width: 40%;
  box-sizing: border-box;
  overflow: auto;
}
.detail-panel .close {
  position: absolute;
  right: 8px;
  top: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

/* navigation */
.nav { display: flex; gap: 8px; align-items: center; }
.nav-btn { padding: 6px 8px; border: 1px solid var(--color-border); background: white; border-radius: 6px; cursor: pointer; }
.month-label { font-weight: 600; }

</style>