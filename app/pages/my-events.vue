<template>
  <section class="my-events-page">
    
    <div v-if="!auth.isAuthInitialized || !auth.profile" class="empty-state">
      <div class="empty-content">
        <h2>Your Personal Schedule</h2>
        <p>Please log in to view your upcoming volunteer events.</p>
        <NuxtLink to="/login" class="btn primary">Log In</NuxtLink>
      </div>
    </div>

    <div v-else class="main-layout">
      
      <header class="stats-bar">
        <div class="stat-card">
          <span class="stat-label">Events Completed</span>
          <div class="stat-value">{{ userStats.completedCount }}</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Hours Contributed</span>
          <div class="stat-value">{{ userStats.totalHours }}</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Orgs Supported</span>
          <div class="stat-value">{{ userStats.orgCount }}</div>
        </div>
        <div class="stat-card highlight">
          <span class="stat-label">Impact Score</span>
          <div class="stat-value">
            <UIcon name="i-lucide-zap" class="icon-zap" />
            {{ userStats.impactScore }}
          </div>
        </div>
      </header>

      <div class="content-window">
        <div v-if="eventsStore.isLoading" class="loading-overlay">
          <p>Loading your schedule...</p>
        </div>

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
                    :class="['event-pill', ev.userStatus]"
                    @click.stop="openEvent(ev)"
                  >
                   <span v-if="ev.userStatus === 'completed'">✓</span> {{ ev.title }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      <aside class="detail-panel" role="dialog" aria-label="Event details">
          <div v-if="selectedEvent">
            <div class="panel-header">
              <span :class="['status-badge', selectedAttendance?.status]">
                {{ formatStatus(selectedAttendance?.status) }}
              </span>
            </div>

            <h2>{{ selectedEvent.title }}</h2>
            
            <div class="meta">
              <div><strong>Organization:</strong> {{ selectedEvent.organizationName }}</div>
              <div><strong>When:</strong> {{ formatDate(selectedEvent.date) }}</div>
              <div><strong>Location:</strong> {{ selectedEvent.location || '—' }}</div>
            </div>

            <div v-if="selectedAttendance?.checkInTime" class="time-card">
                <div class="time-row">
                    <span class="label">Check In:</span>
                    <span class="value">{{ formatTime(selectedAttendance.checkInTime) }}</span>
                </div>
                <div v-if="selectedAttendance?.checkOutTime" class="time-row">
                    <span class="label">Check Out:</span>
                    <span class="value">{{ formatTime(selectedAttendance.checkOutTime) }}</span>
                </div>
                <div v-if="selectedAttendance?.checkOutTime" class="time-row total">
                    <span class="label">Total:</span>
                    <span class="value">{{ calculateDuration(selectedAttendance.checkInTime, selectedAttendance.checkOutTime) }} hrs</span>
                </div>
            </div>
            
            <hr />
            
            <p v-if="selectedEvent.description" class="description">
              {{ selectedEvent.description }}
            </p>
            
            <div class="actions">
              <button class="btn primary" @click="goToEventPage(selectedEvent)">
                View Event Page
              </button>
            </div>
          </div>

          <div v-else class="empty-panel">
            <h3>No event selected</h3>
            <p>Select an event from the calendar to view details.</p>
          </div>
        </aside>
      </div>
    </div>
    <!-- <div v-else class="placeholder-page">
      <p>Please log in to view your events.</p>
    </div> -->
  </section>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~~/stores/auth'
import { useEventsStore } from '~~/stores/events'

const router = useRouter()
const auth = useAuthStore()
const eventsStore = useEventsStore()

const today = new Date()
const activeYear = ref(today.getFullYear())
const activeMonth = ref(today.getMonth()) 
const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const selectedEvent = ref(null)

// --- Fetch Logic ---
watchEffect(async () => {
  if (auth.profile && auth.profile.id) {
    await eventsStore.fetchUserEvents(auth.profile.id);
  }
});

// --- ⭐️ Stats Calculation Logic ---
const userStats = computed(() => {
  if (!eventsStore.userEvents.length || !auth.profile) {
    return { completedCount: 0, totalHours: 0, orgCount: 0, impactScore: 0 };
  }

  let completedCount = 0;
  let totalHours = 0;
  const orgs = new Set(); // To track unique organizations

  eventsStore.userEvents.forEach(ev => {
    // 1. Identify unique organizations user has interacted with
    if (ev.organizationId) {
        orgs.add(ev.organizationId);
    }

    // 2. Find specific attendance record
    const record = ev.attendees?.find(a => a.volunteerId === auth.profile.id);
    
    if (record && record.status === 'completed') {
      completedCount++;

      // 3. Calculate exact hours from timestamps
      if (record.checkInTime && record.checkOutTime) {
        const start = new Date(record.checkInTime).getTime();
        const end = new Date(record.checkOutTime).getTime();
        const durationMs = end - start;
        
        // Sanity check: ensure positive duration
        if (durationMs > 0) {
            const hours = durationMs / (1000 * 60 * 60); 
            totalHours += hours;
        }
      }
    }
  });

  // Round hours to 1 decimal place for display
  const displayHours = Math.round(totalHours * 10) / 10;

  // Impact Score: (Events * 10) + (Floored Hours * 5) + (Orgs * 20 bonus)
  const impactScore = Math.floor((completedCount * 10) + (Math.floor(totalHours) * 5));

  return { 
      completedCount, 
      totalHours: displayHours, 
      orgCount: orgs.size,
      impactScore 
  };
});

// --- Helper: Get specific attendance record for selected event ---
const selectedAttendance = computed(() => {
    if (!selectedEvent.value || !auth.profile) return null;
    // Note: The event object in the store has the full attendees list.
    // However, the object passed to selectedEvent from calendarEvents (below) 
    // might be a simplified version. Let's look up the "real" event from the store to be safe.
    const realEvent = eventsStore.userEvents.find(e => e.id === selectedEvent.value.id);
    return realEvent?.attendees?.find(a => a.volunteerId === auth.profile.id);
});

// --- Data Mapping for Calendar ---
const calendarEvents = computed(() => {
  return eventsStore.userEvents.map(ev => {
    const record = ev.attendees?.find(a => a.volunteerId === auth.profile?.id);
    return {
      id: ev.id,
      title: ev.title,
      date: ev.date, 
      location: typeof ev.location === 'string' ? ev.location : ev.location?.venue,
      organizationName: ev.organizationName,
      description: ev.description,
      isExternal: ev.isExternal,
      externalUrl: ev.externalUrl,
      // Pass this down so the pill knows its color
      userStatus: record?.status || 'registered' 
    }
  })
})

const cells = computed(() => {
  const year = activeYear.value
  const month = activeMonth.value
  const firstOfMonth = new Date(year, month, 1)
  const startDay = firstOfMonth.getDay() 
  const startDate = new Date(year, month, 1 - startDay) 

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

function eventsForDay(dateObj) {
  const target = dateObj.toLocaleDateString('en-CA');
  return calendarEvents.value.filter(ev => {
    if (!ev.date) return false;
    const evDate = new Date(ev.date).toLocaleDateString('en-CA');
    return evDate === target;
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

// --- Formatters ---

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function formatTime(iso) {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute:'2-digit' });
}

function calculateDuration(startIso, endIso) {
    if(!startIso || !endIso) return 0;
    const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
    const hours = ms / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100; // 2 decimal places
}

function formatStatus(status) {
  if (status === 'completed') return 'Completed ✅';
  if (status === 'checked-in') return 'Checked In ⏱️';
  return 'Registered 📅';
}

function openEvent(ev) { selectedEvent.value = ev }

function goToEventPage(ev) {
  if (ev.isExternal && ev.externalUrl) {
    window.open(ev.externalUrl, '_blank')
  } else {
    router.push(`/events/${ev.id}`)
  }
}
</script>

<style scoped>
.my-events-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  align-items: center;
  overflow: hidden; 
  padding: 1rem;
  background-color: #f3f4f6;
}

.main-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 16px;
  max-width: 1400px;
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Changed to 4 columns */
  gap: 16px;
  width: 100%;
}

.stat-card {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid var(--color-border, #e5e7eb);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
}
.stat-card.highlight .stat-label { color: rgba(255,255,255,0.9); }
.stat-card.highlight .stat-value { color: white; }

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  text-align: center;
}

/* Main Content Window */
.content-window {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  flex-grow: 1; 
  gap: 16px;
  position: relative;
  min-height: 0; 
}

/* Calendar & Sidebar Layout */
.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  font-weight: bold;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}
.nav-btn {
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  background: white;
  border-radius: 4px;
  cursor: pointer;
}
.month-label { font-weight: bold; font-size: 1.1rem; margin: 0; }

.calendar { 
  display: flex;
  flex-direction: column;
  background: white; 
  padding: 16px; 
  border-radius: 8px;
  width: 65%;
  overflow: auto; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.calendar-grid { display: flex; flex-direction: column; flex-grow: 1; }
.week-head { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 6px; }
.week-day { text-align: center; font-weight: 600; color: #6b7280; font-size: 0.85rem; }

.days-grid { 
  display: grid; 
  grid-template-columns: repeat(7, 1fr); 
  gap: 6px; 
  flex-grow: 1; 
  grid-auto-rows: 1fr; 
}

.day-cell {
  background: #fafafa;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 80px;
}
.day-cell.outside { opacity: 0.4; background: #fff; }
.day-num { font-weight: 700; font-size: 0.85rem; color: #374151; }

.day-events { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }

.event-pill {
  background: #3b82f6; 
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.event-pill.completed { background: #10b981; } 
.event-pill.checked-in { background: #f59e0b; } 

/* Detail Panel */
.detail-panel {
  background: white;
  padding: 1.5rem;
  width: 35%;
  border-radius: 8px;
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.panel-header { margin-bottom: 1rem; }
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: #e5e7eb;
  color: #374151;
}
.status-badge.completed { background: #d1fae5; color: #065f46; }
.status-badge.checked-in { background: #fef3c7; color: #92400e; }

/* Time Card Styles */
.time-card {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    padding: 12px;
    margin: 1rem 0;
}
.time-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    margin-bottom: 4px;
    color: #0369a1;
}
.time-row.total {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #bae6fd;
    font-weight: bold;
    color: #0c4a6e;
}

.meta { margin: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem; color: #4b5563; font-size: 0.9rem; }
.description { color: #374151; line-height: 1.5; margin-bottom: 1.5rem; }
hr { border: 0; border-top: 1px solid #e5e7eb; margin: 1rem 0; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}
.btn.primary { background-color: #10b981; color: white; border: none; }
.btn.primary:hover { background-color: #059669; }
</style>