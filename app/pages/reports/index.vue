<template>
  <div class="reports-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <Icon name="heroicons:arrow-path" class="spinner" size="3rem" />
      <p>Loading reports data...</p>
    </div>

    <!-- Page Header -->
    <div v-else class="page-header">
      <h1>Reports & Analytics</h1>
      <p>Track volunteer hours, generate reports, and analyze program impact</p>
    </div>

    <!-- Navigation Tabs -->
    <div v-if="!isLoading" class="tabs-container">
      <button 
        v-for="tab in ['overview', 'check-in', 'analytics', 'reports']" 
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
        class="tab-button"
      >
        <Icon :name="getTabIcon(tab)" />
        {{ formatTabName(tab) }}
      </button>
    </div>

    <!-- TAB 1: Overview -->
    <div v-if="activeTab === 'overview' && !isLoading" class="tab-content">
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">
            <Icon name="heroicons:user-group" size="2rem" />
          </div>
          <h3>Total Volunteers</h3>
          <p class="metric-value">{{ overviewStats.totalVolunteers }}</p>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <Icon name="heroicons:clock" size="2rem" />
          </div>
          <h3>Total Hours</h3>
          <p class="metric-value">{{ overviewStats.totalHours.toFixed(1) }}</p>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <Icon name="heroicons:calendar-days" size="2rem" />
          </div>
          <h3>Total Events</h3>
          <p class="metric-value">{{ overviewStats.totalEvents }}</p>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <Icon name="heroicons:sparkles" size="2rem" />
          </div>
          <h3>Avg Hours/Volunteer</h3>
          <p class="metric-value">{{ overviewStats.avgHoursPerVolunteer.toFixed(1) }}</p>
        </div>
      </div>
    </div>

    <!-- TAB 2: Check-In/Check-Out -->
    <div v-if="activeTab === 'check-in' && !isLoading" class="tab-content">
      <div class="check-in-container">
        <div class="section">
          <h2>Event Check-In/Check-Out</h2>
          
          <!-- Event Selection -->
          <div class="form-group">
            <label>Select Event</label>
            <select v-model="selectedEventId" class="form-control">
              <option value="">-- Select an event --</option>
              <option v-for="event in upcomingEvents" :key="event.id" :value="event.id">
                {{ event.title }} - {{ formatDate(event.date) }}
              </option>
            </select>
          </div>

          <div v-if="selectedEvent" class="event-details">
            <h3>{{ selectedEvent.title }}</h3>
            <p><strong>Date:</strong> {{ formatDate(selectedEvent.date) }}</p>
            <p><strong>Location:</strong> {{ selectedEvent.location }}</p>
            <p><strong>Registered Volunteers:</strong> {{ selectedEvent.volunteersSignedUp }}</p>
          </div>

          <!-- Volunteer Check-In Form -->
          <div v-if="selectedEventId" class="check-in-form">
            <h3>Volunteer Check-In</h3>
            
            <div class="form-group">
              <label>Search Volunteer</label>
              <input 
                v-model="volunteerSearch"
                type="text"
                placeholder="Search by name or email..."
                class="form-control"
              />
            </div>

            <!-- Filtered Volunteers -->
            <div v-if="filteredVolunteers.length > 0" class="volunteer-list">
              <div 
                v-for="volunteer in filteredVolunteers" 
                :key="volunteer.id"
                class="volunteer-item"
              >
                <div class="volunteer-info">
                  <div class="avatar">{{ getInitials(volunteer.name) }}</div>
                  <div>
                    <p class="name">{{ volunteer.name }}</p>
                    <p class="email">{{ volunteer.email }}</p>
                  </div>
                </div>
                <div class="volunteer-actions">
                  <button 
                    @click="checkInVolunteer(volunteer.id)"
                    :disabled="volunteer.status === 'checked-in'"
                    class="btn btn-success"
                  >
                    <Icon name="heroicons:arrow-down-on-square" />
                    Check In
                  </button>
                  <button 
                    @click="checkOutVolunteer(volunteer.id)"
                    :disabled="volunteer.status !== 'checked-in'"
                    class="btn btn-warning"
                  >
                    <Icon name="heroicons:arrow-up-on-square" />
                    Check Out
                  </button>
                </div>
              </div>
            </div>

            <!-- Checked-In Volunteers List -->
            <div v-if="checkedInVolunteers.length > 0" class="checked-in-list">
              <h3>Currently Checked In</h3>
              <table class="volunteers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Check-In Time</th>
                    <th>Hours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="vol in checkedInVolunteers" :key="vol.id">
                    <td>{{ vol.name }}</td>
                    <td>{{ formatTime(vol.checkInTime) }}</td>
                    <td>{{ calculateHours(vol.checkInTime) }}</td>
                    <td>
                      <button @click="checkOutVolunteer(vol.id)" class="btn btn-sm btn-warning">
                        Check Out
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Analytics & Dashboards -->
    <div v-if="activeTab === 'analytics' && !isLoading" class="tab-content">
      <div class="analytics-container">
        <h2>Analytics Dashboard</h2>

        <!-- Date Range Filter -->
        <div class="filter-section">
          <div class="form-group">
            <label>Date Range</label>
            <div class="date-range">
              <input v-model="analyticsDateFrom" type="date" class="form-control" />
              <span>to</span>
              <input v-model="analyticsDateTo" type="date" class="form-control" />
              <button @click="loadAnalytics" class="btn btn-primary">
                <Icon name="heroicons:arrow-path" /> Refresh
              </button>
            </div>
          </div>
        </div>

        <!-- Summary Metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <h4>Total Participation</h4>
            <p class="metric-value">{{ analyticsData.totalParticipants }}</p>
            <p class="metric-sub">volunteers</p>
          </div>

          <div class="metric-card">
            <h4>Total Hours Logged</h4>
            <p class="metric-value">{{ analyticsData.totalHours.toFixed(1) }}</p>
            <p class="metric-sub">hours</p>
          </div>

          <div class="metric-card">
            <h4>Program Impact</h4>
            <p class="metric-value">{{ (analyticsData.totalHours * 25).toFixed(0) }}</p>
            <p class="metric-sub">estimated value ($25/hr)</p>
          </div>

          <div class="metric-card">
            <h4>Events Held</h4>
            <p class="metric-value">{{ analyticsData.totalEvents }}</p>
            <p class="metric-sub">events</p>
          </div>
        </div>

        <!-- Top Volunteers -->
        <div class="section">
          <h3>Top Volunteers</h3>
          <table v-if="analyticsData.topVolunteers.length > 0" class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Events Attended</th>
                <th>Total Hours</th>
                <th>Participation %</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(vol, index) in analyticsData.topVolunteers.slice(0, 10)" :key="index">
                <td>{{ vol.name }}</td>
                <td>{{ vol.events }}</td>
                <td>{{ vol.hours.toFixed(1) }}</td>
                <td>{{ vol.participation }}%</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-state">No volunteer data available</p>
        </div>

        <!-- Event Breakdown -->
        <div class="section">
          <h3>Events Breakdown</h3>
          <table v-if="analyticsData.events.length > 0" class="data-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Volunteers</th>
                <th>Total Hours</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in analyticsData.events" :key="event.id">
                <td>{{ event.name }}</td>
                <td>{{ formatDate(event.date) }}</td>
                <td>{{ event.volunteers }}</td>
                <td>{{ event.totalHours.toFixed(1) }}</td>
                <td>{{ event.completionRate }}%</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-state">No event data available</p>
        </div>
      </div>
    </div>

    <!-- TAB 4: Generate Reports -->
    <div v-if="activeTab === 'reports' && !isLoading" class="tab-content">
      <div class="reports-container">
        <h2>Download Reports</h2>

        <div class="report-form">
          <!-- Date Range -->
          <div class="form-group">
            <label>Report Period</label>
            <div class="date-range">
              <input v-model="reportDateFrom" type="date" class="form-control" />
              <span>to</span>
              <input v-model="reportDateTo" type="date" class="form-control" />
            </div>
          </div>

          <!-- Format Selection -->
          <div class="form-group">
            <label>Export Format</label>
            <div class="format-options">
              <label class="radio-option">
                <input v-model="selectedFormat" type="radio" value="pdf" />
                <span>
                  <Icon name="heroicons:document-text" />
                  PDF Report
                </span>
              </label>
              <label class="radio-option">
                <input v-model="selectedFormat" type="radio" value="csv" />
                <span>
                  <Icon name="heroicons:table-cells" />
                  CSV Spreadsheet
                </span>
              </label>
              <label class="radio-option">
                <input v-model="selectedFormat" type="radio" value="json" />
                <span>
                  <Icon name="heroicons:code-bracket" />
                  JSON Data
                </span>
              </label>
            </div>
          </div>

          <!-- Organization Selection (for admins) -->
          <div v-if="userOrganizations.length > 0" class="form-group">
            <label>Organization (Optional)</label>
            <select v-model="selectedOrgId" class="form-control">
              <option value="">-- My Organization --</option>
              <option v-for="org in userOrganizations" :key="org.id" :value="org.id">
                {{ org.name }}
              </option>
            </select>
          </div>

          <!-- Generate Button -->
          <button 
            @click="generateReport"
            :disabled="isGeneratingReport"
            class="btn btn-primary btn-lg"
          >
            <Icon v-if="!isGeneratingReport" name="heroicons:arrow-down-tray" />
            <Icon v-else name="heroicons:arrow-path" class="spinner" />
            {{ isGeneratingReport ? 'Generating...' : 'Generate & Download Report' }}
          </button>

          <!-- Error/Success Messages -->
          <div v-if="reportError" class="alert alert-error">
            <Icon name="heroicons:exclamation-circle" />
            {{ reportError }}
          </div>
          <div v-if="reportSuccess" class="alert alert-success">
            <Icon name="heroicons:check-circle" />
            {{ reportSuccess }}
          </div>
        </div>

        <!-- Report Preview -->
        <div v-if="reportPreviewData" class="report-preview">
          <h3>Report Preview</h3>
          <div class="preview-summary">
            <div class="preview-item">
              <span class="label">Organization:</span>
              <span class="value">{{ reportPreviewData.org.name }}</span>
            </div>
            <div class="preview-item">
              <span class="label">Period:</span>
              <span class="value">{{ formatDate(reportPreviewData.dateRange.from) }} - {{ formatDate(reportPreviewData.dateRange.to) }}</span>
            </div>
            <div class="preview-item">
              <span class="label">Total Events:</span>
              <span class="value">{{ reportPreviewData.totalEvents }}</span>
            </div>
            <div class="preview-item">
              <span class="label">Total Volunteers:</span>
              <span class="value">{{ reportPreviewData.totalParticipants }}</span>
            </div>
            <div class="preview-item">
              <span class="label">Total Hours:</span>
              <span class="value">{{ reportPreviewData.totalHours.toFixed(1) }}</span>
            </div>
            <div class="preview-item">
              <span class="label">Program Impact Value:</span>
              <span class="value">${{ (reportPreviewData.totalHours * 25).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~~/stores/auth'
import { useOrgStore } from '~~/stores/orgs'
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'

const authStore = useAuthStore()
const orgStore = useOrgStore()

// State
const activeTab = ref('overview')
const selectedEventId = ref('')
const volunteerSearch = ref('')
const analyticsDateFrom = ref(getDateString(new Date(new Date().setMonth(new Date().getMonth() - 1))))
const analyticsDateTo = ref(getDateString(new Date()))
const reportDateFrom = ref(getDateString(new Date(new Date().setMonth(new Date().getMonth() - 1))))
const reportDateTo = ref(getDateString(new Date()))
const selectedFormat = ref('pdf')
const selectedOrgId = ref('')
const isGeneratingReport = ref(false)
const reportError = ref('')
const reportSuccess = ref('')
const reportPreviewData = ref<any>(null)
const isLoading = ref(true)
const isLoadingAnalytics = ref(false)
const upcomingEvents = ref<any[]>([])
const allVolunteers = ref<any[]>([])
const checkedInVolunteers = ref<any[]>([])
const analyticsData = ref<{
  totalParticipants: number
  totalHours: number
  totalEvents: number
  topVolunteers: Array<{ id: string; name: string; hours: number; events: number; participation: number }>
  events: Array<{ id: string; name: string; date: string; volunteers: number; totalHours: number; completionRate: number }>
}>({
  totalParticipants: 0,
  totalHours: 0,
  totalEvents: 0,
  topVolunteers: [],
  events: []
})
const overviewStats = ref({
  totalVolunteers: 0,
  totalHours: 0,
  totalEvents: 0,
  avgHoursPerVolunteer: 0
})

// Computed
const selectedEvent = computed(() => 
  upcomingEvents.value.find(e => e.id === selectedEventId.value)
)

const filteredVolunteers = computed(() => {
  if (!volunteerSearch.value) return allVolunteers.value
  const search = volunteerSearch.value.toLowerCase()
  return allVolunteers.value.filter(v => 
    v.name.toLowerCase().includes(search) || 
    v.email.toLowerCase().includes(search)
  )
})

const userOrganizations = computed(() => {
  return orgStore.allOrganizations || []
})

// Methods
function getTabIcon(tab: string) {
  const icons: Record<string, string> = {
    overview: 'heroicons:chart-bar',
    'check-in': 'heroicons:clipboard-document-check',
    analytics: 'heroicons:chart-pie',
    reports: 'heroicons:document-download'
  }
  return icons[tab] || 'heroicons:document'
}

function formatTabName(tab: string) {
  return tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function getDateString(date: Date): string {
  const dateStr = date.toISOString().split('T')[0]
  return dateStr || ''
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function calculateHours(checkInTime: string | null): string {
  if (!checkInTime) return '0'
  const checkIn = new Date(checkInTime).getTime()
  const now = new Date().getTime()
  const hours = (now - checkIn) / (1000 * 60 * 60)
  return hours.toFixed(1)
}



async function loadEventsData() {
  try {
    const db = getFirestore()
    const orgId = selectedOrgId.value || authStore.profile?.organizationId
    
    if (!orgId) {
      console.warn('No organization ID available')
      upcomingEvents.value = []
      return
    }

    const eventsRef = collection(db, 'events')
    const q = query(eventsRef, where('organizationId', '==', orgId))
    const snapshot = await getDocs(q)
    
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as any
    }))

    upcomingEvents.value = events.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error('Error loading events:', error)
    upcomingEvents.value = []
  }
}

async function loadVolunteersForEvent(eventId: string) {
  try {
    const db = getFirestore()
    const eventRef = doc(db, 'events', eventId)
    const eventSnap = await getDoc(eventRef)
    
    if (!eventSnap.exists()) return

    const eventData = eventSnap.data()
    const attendees = eventData.attendees || []

    const volunteers: any[] = []
    for (const attendee of attendees) {
      try {
        const userRef = doc(db, 'users', attendee.volunteerId)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const userData = userSnap.data()
          volunteers.push({
            id: attendee.volunteerId,
            name: userData.name || 'Unknown',
            email: userData.email || 'N/A',
            status: attendee.status || 'registered',
            checkInTime: attendee.checkInTime || null,
            checkOutTime: attendee.checkOutTime || null,
            hoursVerified: attendee.hoursVerified || false
          })
        }
      } catch (err) {
        console.error(`Error loading volunteer ${attendee.volunteerId}:`, err)
      }
    }

    allVolunteers.value = volunteers
    checkedInVolunteers.value = volunteers.filter(v => v.status === 'checked-in')
  } catch (error) {
    console.error('Error loading volunteers:', error)
    allVolunteers.value = []
  }
}

async function checkInVolunteer(volunteerId: string) {
  try {
    if (!selectedEventId.value) return

    const db = getFirestore()
    const eventRef = doc(db, 'events', selectedEventId.value)
    const eventSnap = await getDoc(eventRef)
    
    if (!eventSnap.exists()) return

    const eventData = eventSnap.data()
    const attendees = eventData.attendees || []
    
    const attendeeIndex = attendees.findIndex((a: any) => a.volunteerId === volunteerId)
    if (attendeeIndex !== -1) {
      attendees[attendeeIndex].status = 'checked-in'
      attendees[attendeeIndex].checkInTime = new Date().toISOString()
      
      await updateDoc(eventRef, { attendees })
      
      await loadVolunteersForEvent(selectedEventId.value)
    }
  } catch (error) {
    console.error('Error checking in volunteer:', error)
  }
}

async function checkOutVolunteer(volunteerId: string) {
  try {
    if (!selectedEventId.value) return

    const db = getFirestore()
    const eventRef = doc(db, 'events', selectedEventId.value)
    const eventSnap = await getDoc(eventRef)
    
    if (!eventSnap.exists()) return

    const eventData = eventSnap.data()
    const attendees = eventData.attendees || []
    
    const attendeeIndex = attendees.findIndex((a: any) => a.volunteerId === volunteerId)
    if (attendeeIndex !== -1) {
      attendees[attendeeIndex].status = 'completed'
      attendees[attendeeIndex].checkOutTime = new Date().toISOString()
      
      await updateDoc(eventRef, { attendees })
      
      await loadVolunteersForEvent(selectedEventId.value)
    }
  } catch (error) {
    console.error('Error checking out volunteer:', error)
  }
}

async function loadAnalytics() {
  try {
    isLoadingAnalytics.value = true
    const db = getFirestore()
    const orgId = selectedOrgId.value || authStore.profile?.organizationId
    
    if (!orgId) return

    const dateFrom = new Date(analyticsDateFrom.value)
    const dateTo = new Date(analyticsDateTo.value)

    const eventsRef = collection(db, 'events')
    const q = query(eventsRef, where('organizationId', '==', orgId))
    const snapshot = await getDocs(q)
    
    const events = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() as any }))
      .filter((e: any) => {
        const eventDate = new Date(e.date)
        return eventDate >= dateFrom && eventDate <= dateTo
      })

    let totalParticipants = 0
    let totalHours = 0
    const volunteerHours: Record<string, { name: string; hours: number; events: Set<string> }> = {}
    const eventData: any[] = []

    for (const event of events) {
      const attendees = event.attendees || []
      let eventTotalHours = 0
      let eventCompletedCount = 0

      for (const attendee of attendees) {
        totalParticipants++
        
        let hours = 0
        if (attendee.checkInTime && attendee.checkOutTime) {
          const checkIn = new Date(attendee.checkInTime).getTime()
          const checkOut = new Date(attendee.checkOutTime).getTime()
          hours = (checkOut - checkIn) / (1000 * 60 * 60)
        }

        totalHours += hours
        eventTotalHours += hours

        if (attendee.status === 'completed') {
          eventCompletedCount++
        }

        if (!volunteerHours[attendee.volunteerId]) {
          try {
            const userRef = doc(db, 'users', attendee.volunteerId)
            const userSnap = await getDoc(userRef)
            const userName = userSnap.exists() ? userSnap.data().name : 'Unknown'
            
            volunteerHours[attendee.volunteerId] = {
              name: userName,
              hours: 0,
              events: new Set()
            }
          } catch (err) {
            volunteerHours[attendee.volunteerId] = { name: 'Unknown', hours: 0, events: new Set() }
          }
        }

        const volHours = volunteerHours[attendee.volunteerId]
        if (volHours) {
          volHours.hours += hours
          volHours.events.add(event.id)
        }
      }

      eventData.push({
        id: event.id,
        name: event.title,
        date: event.date,
        volunteers: attendees.length,
        totalHours: eventTotalHours,
        completionRate: attendees.length > 0 ? Math.round((eventCompletedCount / attendees.length) * 100) : 0
      })
    }

    const topVolunteers = Object.entries(volunteerHours)
      .map(([id, data]) => ({
        id,
        name: data.name,
        hours: data.hours,
        events: data.events.size,
        participation: totalHours > 0 ? Math.round((data.hours / totalHours) * 100) : 0
      }))
      .sort((a, b) => b.hours - a.hours)

    analyticsData.value = {
      totalParticipants,
      totalHours,
      totalEvents: events.length,
      topVolunteers,
      events: eventData
    }
  } catch (error) {
    console.error('Error loading analytics:', error)
  } finally {
    isLoadingAnalytics.value = false
  }
}

async function calculateOverviewStats() {
  try {
    const db = getFirestore()
    const orgId = authStore.profile?.organizationId
    
    if (!orgId) return

    const eventsRef = collection(db, 'events')
    const q = query(eventsRef, where('organizationId', '==', orgId))
    const snapshot = await getDocs(q)
    
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))

    let totalVolunteers = 0
    let totalHours = 0
    const uniqueVolunteers = new Set()

    for (const event of events) {
      const attendees = event.attendees || []
      
      for (const attendee of attendees) {
        uniqueVolunteers.add(attendee.volunteerId)
        
        if (attendee.checkInTime && attendee.checkOutTime) {
          const checkIn = new Date(attendee.checkInTime).getTime()
          const checkOut = new Date(attendee.checkOutTime).getTime()
          const hours = (checkOut - checkIn) / (1000 * 60 * 60)
          totalHours += hours
        }
      }
    }

    totalVolunteers = uniqueVolunteers.size

    overviewStats.value = {
      totalVolunteers,
      totalHours,
      totalEvents: events.length,
      avgHoursPerVolunteer: totalVolunteers > 0 ? totalHours / totalVolunteers : 0
    }
  } catch (error) {
    console.error('Error calculating overview stats:', error)
  }
}

async function generateReport() {
  try {
    isGeneratingReport.value = true
    reportError.value = ''
    reportSuccess.value = ''

    const orgId = selectedOrgId.value || authStore.profile?.organizationId || 'default'

    // Fetch report data
    const response = await fetch('/api/reports/org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgId,
        dateFrom: reportDateFrom.value,
        dateTo: reportDateTo.value,
        format: selectedFormat.value === 'json' ? 'json' : selectedFormat.value
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    if (selectedFormat.value === 'json') {
      const data = await response.json()
      reportPreviewData.value = data
      reportSuccess.value = 'Report generated successfully!'
    } else {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${orgId}-${new Date().toISOString().split('T')[0]}.${selectedFormat.value}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      reportSuccess.value = `${selectedFormat.value.toUpperCase()} report downloaded successfully!`
    }
  } catch (error) {
    reportError.value = error instanceof Error ? error.message : 'Failed to generate report'
    console.error('Error generating report:', error)
  } finally {
    isGeneratingReport.value = false
  }
}

// Watchers
watch(() => selectedEventId.value, (newEventId) => {
  volunteerSearch.value = ''
  if (newEventId) {
    loadVolunteersForEvent(newEventId)
  }
})

watch(() => selectedOrgId.value, () => {
  loadEventsData()
  calculateOverviewStats()
  loadAnalytics()
})

// Lifecycle
onMounted(async () => {
  try {
    await loadEventsData()
    await calculateOverviewStats()
    await loadAnalytics()
  } catch (error) {
    console.error('Error initializing reports:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.reports-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.spinner {
  animation: spin 1s linear infinite;
  color: #2563eb;
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #64748b;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
  flex-wrap: wrap;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #2563eb;
}

.tab-button.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
}

.metric-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #2563eb;
}

.metric-icon {
  color: #2563eb;
  margin-bottom: 1rem;
}

.metric-card h3 {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
}

.metric-sub {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* Forms */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.date-range {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.date-range input {
  flex: 1;
  min-width: 150px;
}

.date-range span {
  color: #64748b;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-lg {
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Check-In Section */
.check-in-container {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  border: 1px solid #e2e8f0;
}

.section {
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.event-details {
  background: #f0f9ff;
  border-left: 4px solid #2563eb;
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 0.375rem;
}

.event-details p {
  margin: 0.5rem 0;
  color: #1e293b;
}

/* Volunteer List */
.volunteer-list {
  margin-bottom: 2rem;
}

.volunteer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  background: white;
}

.volunteer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.volunteer-info p {
  margin: 0;
}

.name {
  font-weight: 600;
  color: #1e293b;
}

.email {
  font-size: 0.875rem;
  color: #64748b;
}

.volunteer-actions {
  display: flex;
  gap: 0.5rem;
}

/* Tables */
.volunteers-table,
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.volunteers-table th,
.data-table th {
  background: #f1f5f9;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
}

.volunteers-table td,
.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
}

.volunteers-table tr:hover,
.data-table tr:hover {
  background: #f8fafc;
}

/* Analytics */
.analytics-container {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  border: 1px solid #e2e8f0;
}

.filter-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.checked-in-list {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

/* Reports */
.reports-container {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  border: 1px solid #e2e8f0;
}

.report-form {
  margin-bottom: 2rem;
}

.format-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-option:hover {
  border-color: #2563eb;
  background: #f0f9ff;
}

.radio-option input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.radio-option input[type="radio"]:checked + span {
  color: #2563eb;
  font-weight: 600;
}

.radio-option span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.report-preview {
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 2rem;
}

.preview-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: white;
  border-radius: 0.375rem;
}

.preview-item .label {
  font-weight: 600;
  color: #1e293b;
}

.preview-item .value {
  color: #2563eb;
  font-weight: 600;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.alert-success {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .reports-page {
    padding: 1rem;
  }

  .volunteer-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .volunteer-actions {
    width: 100%;
    margin-top: 1rem;
  }

  .volunteer-actions button {
    flex: 1;
  }

  .tabs-container {
    gap: 0.5rem;
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .date-range {
    flex-direction: column;
  }

  .date-range input {
    width: 100%;
  }
}
</style>
