<script setup lang="ts">
import type { OrgReportData } from '../../../types'
import { useOrgReport } from '../../../composables/useOrgReport'

const { fetchReportData, downloadReportPdf, downloadReportCsv } = useOrgReport()

const reportData = ref<OrgReportData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const orgId = ref('org-1')
const dateFrom = ref('2025-11-01')
const dateTo = ref('2025-12-31')

async function loadReport() {
  loading.value = true
  error.value = null
  try {
    reportData.value = await fetchReportData({
      orgId: orgId.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load report'
  } finally {
    loading.value = false
  }
}

async function downloadPdf() {
  loading.value = true
  error.value = null
  try {
    await downloadReportPdf({
      orgId: orgId.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to download PDF'
  } finally {
    loading.value = false
  }
}

async function downloadCsv() {
  loading.value = true
  error.value = null
  try {
    await downloadReportCsv({
      orgId: orgId.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to download CSV'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="py-8">
      <h1 class="text-3xl font-bold mb-6">
        Organization Report Example
      </h1>

      <!-- Form -->
      <div class="mb-6 p-6 border rounded-lg bg-white shadow">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Organization ID</label>
            <input v-model="orgId" type="text" placeholder="org-1" class="w-full px-3 py-2 border rounded" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">From Date</label>
              <input v-model="dateFrom" type="date" class="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">To Date</label>
              <input v-model="dateTo" type="date" class="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="loadReport" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {{ loading ? 'Loading...' : 'Load Report (JSON)' }}
            </button>
            <button @click="downloadPdf" :disabled="loading" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
              {{ loading ? 'Loading...' : 'Download PDF' }}
            </button>
            <button @click="downloadCsv" :disabled="loading" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
              {{ loading ? 'Loading...' : 'Download CSV' }}
            </button>
          </div>

          <div v-if="error" class="p-3 bg-red-100 text-red-800 rounded">
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Report Display -->
      <div v-if="reportData" class="p-6 border rounded-lg bg-white shadow">
        <h2 class="text-2xl font-bold mb-4">
          {{ reportData.org.name }}
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-500">Total Events</p>
            <p class="text-2xl font-bold">{{ reportData.totalEvents }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Participants</p>
            <p class="text-2xl font-bold">{{ reportData.totalParticipants }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Hours</p>
            <p class="text-2xl font-bold">{{ reportData.totalHours.toFixed(1) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Avg Hours/Participant</p>
            <p class="text-2xl font-bold">{{ reportData.averageHoursPerParticipant.toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Avg Participants/Event</p>
            <p class="text-2xl font-bold">{{ reportData.averageParticipantsPerEvent.toFixed(1) }}</p>
          </div>
        </div>

        <h3 class="text-xl font-bold mb-3">Events</h3>
        <div class="overflow-x-auto mb-6">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="border px-4 py-2 text-left">Event</th>
                <th class="border px-4 py-2 text-left">Date</th>
                <th class="border px-4 py-2 text-left">Participants</th>
                <th class="border px-4 py-2 text-left">Hours</th>
                <th class="border px-4 py-2 text-left">Location</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in reportData.events" :key="event.id" class="border-b hover:bg-gray-50">
                <td class="border px-4 py-2">{{ event.name }}</td>
                <td class="border px-4 py-2">{{ event.date instanceof Date ? event.date.toLocaleDateString() : new Date(event.date).toLocaleDateString() }}</td>
                <td class="border px-4 py-2">{{ event.participants }}</td>
                <td class="border px-4 py-2">{{ event.duration }}</td>
                <td class="border px-4 py-2">{{ event.location }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-xl font-bold mb-3">Individual Volunteers</h3>
        <div v-if="reportData.perUserSummaries.length > 0" class="overflow-x-auto mb-6">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="border px-4 py-2 text-left">Email</th>
                <th class="border px-4 py-2 text-left">Events</th>
                <th class="border px-4 py-2 text-left">Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in reportData.perUserSummaries" :key="user.userId" class="border-b hover:bg-gray-50">
                <td class="border px-4 py-2">{{ user.email || user.userId }}</td>
                <td class="border px-4 py-2">{{ user.totalEvents }}</td>
                <td class="border px-4 py-2">{{ user.totalHours.toFixed(1) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-500 mb-6">No individual volunteer records</p>

        <h3 class="text-xl font-bold mb-3">Group Attendance</h3>
        <div v-if="reportData.groupSummaries.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="border px-4 py-2 text-left">Group</th>
                <th class="border px-4 py-2 text-left">Events</th>
                <th class="border px-4 py-2 text-left">Participants</th>
                <th class="border px-4 py-2 text-left">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(group, idx) in reportData.groupSummaries" :key="idx" class="border-b hover:bg-gray-50">
                <td class="border px-4 py-2">{{ group.groupLabel }}</td>
                <td class="border px-4 py-2">{{ group.totalEvents }}</td>
                <td class="border px-4 py-2">{{ group.totalParticipants }}</td>
                <td class="border px-4 py-2">{{ group.totalHours.toFixed(1) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-500">No group attendance records</p>
      </div>
    </div>
  </div>
</template>
